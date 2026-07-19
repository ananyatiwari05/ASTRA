import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  MoreThan,
} from 'typeorm';

import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';
import { Contest } from '../contests/entities/contest.entity';
import { SheetProblem } from '../sheets/entities/sheet-problem.entity';
import { UserSheetProgress } from '../sheets/entities/user-sheet-progress.entity';
import { UnifiedSolveService } from '../unified/unified-solve.service';
import { isAcceptedVerdict } from '../../common/utils/submission-problem.util';
import { normalizeTag } from '../../common/utils/tag.util';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,

    @InjectRepository(Problem)
    private problemsRepository: Repository<Problem>,

    @InjectRepository(Contest)
    private contestRepository: Repository<Contest>,

    @InjectRepository(SheetProblem)
    private sheetProblemRepo: Repository<SheetProblem>,

    @InjectRepository(UserSheetProgress)
    private userSheetProgressRepo: Repository<UserSheetProgress>,

    private readonly unifiedSolveService: UnifiedSolveService,
  ) { }

  async getUserAnalytics(userId: number) {
    const [
      solvedProblems,
      topicBreakdown,
      difficultyDistribution,
      contestWeaknesses,
      progressTrend,
      contestCount,
    ] = await Promise.all([
      this.unifiedSolveService.getUnifiedSolvedProblems(userId),
      this.unifiedSolveService.getTopicBreakdown(userId),
      this.unifiedSolveService.getDifficultyDistribution(userId),
      this.unifiedSolveService.getContestWeaknesses(userId),
      this.getUserProgressTrend(userId, 30),
      this.contestRepository.count({ where: { userId } }),
    ]);

    const totalSolved = solvedProblems.length;
    const totalAttempts = topicBreakdown.reduce(
      (sum, topic) => sum + topic.attempted,
      0,
    );
    const totalSuccesses = topicBreakdown.reduce(
      (sum, topic) => sum + topic.solved,
      0,
    );
    const overallSuccessRate =
      totalAttempts > 0
        ? Math.round((totalSuccesses / totalAttempts) * 10000) / 100
        : totalSolved > 0
          ? 100
          : 0;

    const sortedTopics = [...topicBreakdown].sort(
      (a, b) => b.successRate - a.successRate,
    );

    const strongestTopic = sortedTopics[0] ?? null;
    const weakestTopic =
      [...topicBreakdown].sort(
        (a, b) => a.successRate - b.successRate,
      )[0] ?? null;

    const weaknesses = await this.getUserWeaknesses(userId);

    // DSA Health Calculation
    const latestContest = await this.contestRepository.findOne({ where: { userId }, order: { contestId: 'DESC' } });
    const rating = latestContest?.newRating ?? 0;
    const ratingScore = Math.min((rating / 2000) * 30, 30);

    const sheetTotal = await this.sheetProblemRepo.count();
    const sheetProgress = await this.userSheetProgressRepo.count({ where: { userId, isSolved: true } });
    const sheetScore = sheetTotal > 0 ? (sheetProgress / sheetTotal) * 25 : 0;

    const accuracyScore = overallSuccessRate * 0.25;
    const consistencyScore = Math.min(contestCount * 2, 20);

    const overallScore = Math.round(ratingScore + sheetScore + accuracyScore + consistencyScore);
    let healthLabel = 'Beginner';
    if (overallScore >= 80) healthLabel = 'Advanced';
    else if (overallScore >= 60) healthLabel = 'Intermediate';
    else if (overallScore >= 40) healthLabel = 'Novice';

    // Advanced Pattern Detection & Strengths
    const patterns: string[] = [];
    const strengths: string[] = [];

    const hardSolved = difficultyDistribution.hard ?? 0;
    const easySolved = difficultyDistribution.easy ?? 0;
    const mediumSolved = difficultyDistribution.medium ?? 0;

    // Negatives
    const constructive = weaknesses.find(w => w.topic === 'constructive algorithms');
    if (constructive && constructive.weaknessScore > 60) patterns.push('You repeatedly fail Constructive Algorithms.');

    const bitmask = weaknesses.find(w => w.topic === 'bitmask');
    if (bitmask && bitmask.weaknessScore > 60) patterns.push('You repeatedly fail Bit Manipulation.');

    const geometry = weaknesses.find(w => w.topic === 'geometry');
    if (geometry && geometry.attemptCount < 2 && contestCount > 5) patterns.push('You repeatedly skip Geometry.');

    const math = weaknesses.find(w => w.topic === 'math');
    const nt = weaknesses.find(w => w.topic === 'number theory');
    if (math && nt && math.successRate > 70 && nt.successRate < 40) patterns.push('You repeatedly solve easy Math but fail Number Theory.');

    if (hardSolved === 0 && easySolved > 20) patterns.push('Never attempts hard problems in contests.');

    // Positives / Strengths
    const bs = weaknesses.find(w => w.topic === 'binary search');
    if (bs && bs.successRate > 80 && bs.solveCount > 5) strengths.push('You consistently solve Binary Search.');

    const greedy = weaknesses.find(w => w.topic === 'greedy');
    if (greedy && greedy.successRate > 85) strengths.push(`You solve Greedy with ${Math.round(greedy.successRate)}% accuracy.`);

    if (overallSuccessRate > 70 && totalSolved > 30) strengths.push('Your implementation accuracy is excellent.');
    if (hardSolved > 0) strengths.push(`You have successfully solved ${hardSolved} hard problems!`);

    // Topic Heatmap Data (Days vs Topics)
    const topicHeatmap = weaknesses.map(w => {
      let status = 'red';
      if (w.solveCount > 0) {
        if (w.reasons.some(r => r.includes('Inactive'))) status = 'yellow';
        else status = 'green';
      }
      return { topic: w.topic, status, attempts: w.attemptCount };
    });

    // Learning Timeline
    const learningTimeline: any[] = [];
    const chronologicalSolves = [...solvedProblems].filter(p => p.solvedAt).sort((a, b) => a.solvedAt!.getTime() - b.solvedAt!.getTime());
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const recentSolves = chronologicalSolves.filter(p => p.solvedAt && p.solvedAt > ninetyDaysAgo);

    const seenTopicsForTimeline = new Set<string>();
    for (const p of recentSolves) {
      if (!p.tags || p.tags.length === 0) continue;
      const mainTag = normalizeTag(p.tags[0]);
      if (!seenTopicsForTimeline.has(mainTag)) {
        learningTimeline.push({ date: p.solvedAt, action: 'Started practicing', topic: mainTag, detail: p.title });
        seenTopicsForTimeline.add(mainTag);
      } else if (p.source === 'contest') {
        if (!learningTimeline.some(l => l.topic === mainTag && l.action === 'Solved in Contest')) {
          learningTimeline.push({ date: p.solvedAt, action: 'Solved in Contest', topic: mainTag, detail: p.title });
        }
      }
    }

    // Recommendations
    const recommendations: any[] = [];
    if (weaknesses.length > 0) {
      const topWeak = weaknesses[0];
      recommendations.push({
        reason: `Your ${topWeak.topic.replace(/_/g, ' ')} success rate is only ${Math.round(topWeak.successRate)}%`,
        priority: 'High',
        estimatedTime: '60 mins',
        difficulty: 'Medium',
        topic: topWeak.topic,
        source: 'A2Z Sheet'
      });
    }
    if (rating > 0) {
      recommendations.push({
        reason: `Your rating is ${rating}, push your boundaries.`,
        priority: 'Medium',
        estimatedTime: '120 mins',
        difficulty: 'Hard',
        topic: 'Mixed',
        source: 'Codeforces'
      });
    }

    return {
      totalSolved,
      totalContests: contestCount,
      overallSuccessRate,
      overallScore,
      healthLabel,
      patterns,
      strengths,
      learningTimeline: learningTimeline.reverse(),
      topicHeatmap,
      recommendations,
      strongestTopic: strongestTopic
        ? {
          topic: strongestTopic.topic,
          successRate: strongestTopic.successRate,
        }
        : null,
      weakestTopic: weakestTopic
        ? {
          topic: weakestTopic.topic,
          successRate: weakestTopic.successRate,
        }
        : null,
      topicBreakdown,
      difficultyDistribution,
      contestPerformance: contestWeaknesses,
      progressTrend,
      weaknesses,
    };
  }

  private generateFailureReason(verdict: string, tags: string[]): string {
    const v = verdict.toLowerCase();
    const t = tags.map((tag) => tag.toLowerCase());

    if (v.includes('time limit')) {
      if (t.includes('dp') || t.includes('dynamic programming')) return 'Too slow / Unoptimized state transition';
      if (t.includes('graphs') || t.includes('dfs and similar')) return 'Too slow / Unoptimized graph traversal';
      if (t.includes('binary search')) return 'Too slow / Infinite loop in binary search';
      return 'Time Limit Exceeded / Suboptimal complexity';
    }

    if (v.includes('wrong answer')) {
      if (t.includes('greedy')) return 'Wrong greedy assumption';
      if (t.includes('math') || t.includes('number theory')) return 'Math observation missed or overflow';
      if (t.includes('binary search')) return 'Incorrect binary search predicate or bounds';
      if (t.includes('constructive algorithms')) return 'Missed edge case in constructive logic';
      if (t.includes('dp')) return 'Incorrect DP state or base case';
      return 'Missed edge case / Logical error';
    }

    if (v.includes('memory limit')) return 'Memory Limit Exceeded / Memory leak or massive array allocation';
    if (v.includes('runtime error')) return 'Runtime Error / Out of bounds indexing or division by zero';

    return 'Failed';
  }

  async getDetailedWeaknesses(userId: number) {
    const [
      topicBreakdown,
      submissions,
      contests,
      sheetProblems,
      sheetProgress,
      solvedProblems,
    ] = await Promise.all([
      this.unifiedSolveService.getTopicBreakdown(userId),
      this.submissionsRepository.find({ where: { userId, platform: 'codeforces' } }),
      this.contestRepository.find({ where: { userId } }),
      this.sheetProblemRepo.find(),
      this.userSheetProgressRepo.find({ where: { userId } }),
      this.unifiedSolveService.getUnifiedSolvedProblems(userId),
    ]);

    const solvedKeys = new Set(
      solvedProblems.map((p) => `${p.platform}:${p.problemId}`),
    );

    const contestIds = new Set(contests.map((c) => c.contestId));
    const contestAttemptsMap = new Map<string, number>();
    const contestFailuresMap = new Map<string, number>();
    const repeatedWrongMap = new Map<string, number>();
    const lastAttemptMap = new Map<string, Date>();
    const failedSubmissionsMap = new Map<string, any[]>();
    const practiceFailuresMap = new Map<string, number>();

    for (const submission of submissions) {
      const isContestMatch = submission.problemId.match(/^(\d+)-/);
      const isContest = isContestMatch && contestIds.has(Number(isContestMatch[1]));
      const isSolved = isAcceptedVerdict(submission.verdict);

      for (const tag of submission.tags ?? []) {
        const topic = normalizeTag(tag);
        if (!topic) continue;

        const currentLast = lastAttemptMap.get(topic);
        if (!currentLast || submission.submittedAt > currentLast) {
          lastAttemptMap.set(topic, submission.submittedAt);
        }

        if (isContest) {
          contestAttemptsMap.set(topic, (contestAttemptsMap.get(topic) ?? 0) + 1);
          if (!isSolved) {
            contestFailuresMap.set(topic, (contestFailuresMap.get(topic) ?? 0) + 1);

            const failedList = failedSubmissionsMap.get(topic) ?? [];
            failedList.push({
              contestId: isContestMatch[1],
              problemId: submission.problemId,
              title: submission.problemName,
              rating: submission.rating ?? 0,
              verdict: submission.verdict,
              tags: submission.tags ?? [],
              reason: this.generateFailureReason(submission.verdict, submission.tags ?? []),
              date: submission.submittedAt
            });
            failedSubmissionsMap.set(topic, failedList);
          }
        } else {
          if (!isSolved) {
            practiceFailuresMap.set(topic, (practiceFailuresMap.get(topic) ?? 0) + 1);
          }
        }

        if (!isSolved) {
          repeatedWrongMap.set(topic, (repeatedWrongMap.get(topic) ?? 0) + 1);
        }
      }
    }

    const solvedProblemIds = new Set(
      sheetProgress.filter((p) => p.isSolved).map((p) => p.sheetProblemId),
    );

    const sheetTotalMap = new Map<string, number>();
    const sheetUnsolvedMap = new Map<string, number>();

    for (const problem of sheetProblems) {
      const isSolved = solvedProblemIds.has(problem.id);
      for (const tag of problem.tags ?? []) {
        const topic = normalizeTag(tag);
        if (!topic) continue;

        sheetTotalMap.set(topic, (sheetTotalMap.get(topic) ?? 0) + 1);
        if (!isSolved) {
          sheetUnsolvedMap.set(topic, (sheetUnsolvedMap.get(topic) ?? 0) + 1);
        }
      }
    }

    const now = new Date();

    return topicBreakdown
      .map((topicStat) => {
        const topic = topicStat.topic;
        const successRate = topicStat.successRate;

        const contestAttempts = contestAttemptsMap.get(topic) ?? 0;
        const contestFailures = contestFailuresMap.get(topic) ?? 0;
        const contestFailureRate =
          contestAttempts > 0 ? (contestFailures / contestAttempts) * 100 : 0;

        const sheetTotal = sheetTotalMap.get(topic) ?? 0;
        const sheetUnsolved = sheetUnsolvedMap.get(topic) ?? 0;
        const sheetUnsolvedRate =
          sheetTotal > 0 ? (sheetUnsolved / sheetTotal) * 100 : 0;

        const repeatedWrongs = repeatedWrongMap.get(topic) ?? 0;

        const lastAttempt = lastAttemptMap.get(topic);
        const daysInactive = lastAttempt ? (now.getTime() - lastAttempt.getTime()) / (1000 * 3600 * 24) : 30;

        // Weakness Engine Formula
        // 40% Contest Failure Rate
        // 25% Sheet Incompletion Rate
        // 20% Low Success Rate
        // 15% Inactivity (Practice Recency)

        const inactivityPenalty = Math.min(daysInactive, 30) / 30 * 100;

        const weaknessScore =
          Math.round(
            (contestFailureRate * 0.4 +
              sheetUnsolvedRate * 0.25 +
              (100 - successRate) * 0.2 +
              inactivityPenalty * 0.15) *
            100,
          ) / 100;

        const reasons: string[] = [];
        if (successRate < 50) reasons.push(`Low success rate (${Math.round(successRate)}%)`);
        if (contestFailures >= 2) reasons.push(`Failed in ${contestFailures} contest problems`);
        if (sheetUnsolvedRate > 50) reasons.push(`${sheetUnsolved} unsolved sheet problems (${Math.round(sheetUnsolvedRate)}%)`);
        if (daysInactive > 14) reasons.push(`Inactive for ${Math.round(daysInactive)} days`);
        if (repeatedWrongs > 5) reasons.push(`${repeatedWrongs} repeated wrong submissions`);

        const suggestedProblems = sheetProblems
          .filter((problem) => {
            const tags = (problem.tags ?? []).map(normalizeTag);
            if (!tags.includes(topic)) return false;
            return !solvedProblemIds.has(problem.id);
          })
          .slice(0, 5)
          .map((problem) => ({
            problemId: problem.problemId,
            title: problem.title,
            platform: problem.platform,
            difficulty: problem.difficulty,
            url: problem.sourceUrl,
          }));

        const failedSubmissions = failedSubmissionsMap.get(topic) ?? [];
        failedSubmissions.sort((a, b) => b.date.getTime() - a.date.getTime());
        // Deduplicate by problemId
        const uniqueFailedContestProblems: any[] = [];
        const seenProblems = new Set<string>();
        for (const sub of failedSubmissions) {
          if (!seenProblems.has(sub.problemId)) {
            uniqueFailedContestProblems.push(sub);
            seenProblems.add(sub.problemId);
          }
        }

        const practiceFailures = practiceFailuresMap.get(topic) ?? 0;
        const solvedRatio = `${topicStat.solved}/${topicStat.attempted}`;

        // Basic Trend logic (if they solved it recently vs failed it recently)
        let trend = 'flat';
        if (topicStat.attempted > 0) {
          const lastFailDate = uniqueFailedContestProblems.length > 0 ? uniqueFailedContestProblems[0].date : new Date(0);
          if (lastAttempt && lastAttempt > lastFailDate) {
            trend = 'up';
          } else if (lastFailDate > new Date(0)) {
            trend = 'down';
          }
        }

        return {
          topic,
          weaknessScore,
          reasons,
          failedProblems: [], // Deprecated
          suggestedProblems,
          failedContestProblems: uniqueFailedContestProblems.slice(0, 5),
          practiceFailures,
          successRate,
          solvedRatio,
          trend,
          solved: topicStat.solved,
          attempted: topicStat.attempted,
          contestFailures,
          contestAppearances: contestAttempts,
          sheetUnsolved,
        };
      })
      .sort((a, b) => b.weaknessScore - a.weaknessScore);
  }

  async getUserWeaknesses(userId: number) {
    const detailed = await this.getDetailedWeaknesses(userId);

    return detailed.map((entry) => ({
      topic: entry.topic,
      attempts: entry.attempted,
      accepted: entry.solved,
      failed: entry.attempted - entry.solved,
      successRate: entry.successRate,
      avgRating: 0,
      attemptCount: entry.attempted,
      solveCount: entry.solved,
      unsolvedCount: entry.failedProblems.length,
      recommendedProblems: entry.suggestedProblems.length,
      totalTaggedProblems: entry.failedProblems.length + entry.solved,
      weaknessScore: entry.weaknessScore,
      reasons: entry.reasons,
      failedContestProblems: entry.failedContestProblems,
      practiceFailures: entry.practiceFailures,
      contestFailures: entry.contestFailures,
      contestAppearances: entry.contestAppearances,
      solvedRatio: entry.solvedRatio,
      trend: entry.trend,
      suggestedProblems: entry.suggestedProblems, // Forward actual recommended problems
    }));
  }

  async getTopicStats(userId: number) {
    const topicBreakdown =
      await this.unifiedSolveService.getTopicBreakdown(userId);

    return topicBreakdown.map((topic) => ({
      topic: topic.topic,
      attempts: topic.attempted,
      solves: topic.solved,
      failures: topic.failed,
      successRate: topic.successRate,
      avgRating: 0,
      totalAttempts: topic.attempted,
      successCount: topic.solved,
      failureCount: topic.failed,
      averageDifficulty: 0,
    }));
  }

  async getUserProgressTrend(userId: number, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const submissions = await this.submissionsRepository.find({
      where: {
        userId,
        submittedAt: MoreThan(startDate),
      },
      order: { submittedAt: 'ASC' },
    });

    const dailyStats: Record<
      string,
      { submissionCount: number; acceptedCount: number }
    > = {};

    for (const submission of submissions) {
      const dateStr = submission.submittedAt.toISOString().split('T')[0];

      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          submissionCount: 0,
          acceptedCount: 0,
        };
      }

      dailyStats[dateStr].submissionCount++;

      if (isAcceptedVerdict(submission.verdict)) {
        dailyStats[dateStr].acceptedCount++;
      }
    }

    const daily: {
      date: string;
      totalSubmissions: number;
      accepted: number;
      submissionCount: number;
      acceptedCount: number;
    }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const stats = dailyStats[dateStr] ?? {
        submissionCount: 0,
        acceptedCount: 0,
      };

      daily.push({
        date: dateStr,
        totalSubmissions: stats.submissionCount,
        accepted: stats.acceptedCount,
        submissionCount: stats.submissionCount,
        acceptedCount: stats.acceptedCount,
      });
    }

    const activeDates = new Set(
      Object.entries(dailyStats)
        .filter(([, stats]) => stats.submissionCount > 0)
        .map(([date]) => date),
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;

    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      if (activeDates.has(dateStr)) {
        streak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = streak;
        }
      } else if (i === 0) {
        currentStreak = 0;
        streak = 0;
      } else {
        longestStreak = Math.max(longestStreak, streak);
        streak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, streak, currentStreak);

    return {
      daily,
      currentStreak,
      longestStreak,
    };
  }
}
