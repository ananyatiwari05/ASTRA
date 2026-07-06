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
  ) {}

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

    return {
      totalSolved,
      totalContests: contestCount,
      overallSuccessRate,
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

    for (const submission of submissions) {
      const contestMatch = submission.problemId.match(/^(\d+)-/);
      if (!contestMatch) continue;
      const contestId = Number(contestMatch[1]);
      if (!contestIds.has(contestId)) continue;

      const isSolved = isAcceptedVerdict(submission.verdict);

      for (const tag of submission.tags ?? []) {
        const topic = normalizeTag(tag);
        if (!topic) continue;

        contestAttemptsMap.set(topic, (contestAttemptsMap.get(topic) ?? 0) + 1);
        if (!isSolved) {
          contestFailuresMap.set(topic, (contestFailuresMap.get(topic) ?? 0) + 1);
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

        // weakness = (100-successRate)*0.5 + contestFailureRate*0.3 + sheetUnsolvedRate*0.2
        const weaknessScore =
          Math.round(
            ((100 - successRate) * 0.5 +
              contestFailureRate * 0.3 +
              sheetUnsolvedRate * 0.2) *
              100,
          ) / 100;

        const reasons: string[] = [];
        if (successRate < 50) {
          reasons.push(`Low success rate (${Math.round(successRate)}%)`);
        }
        if (contestFailures >= 2) {
          reasons.push(`Failed in ${contestFailures} contest problems`);
        }
        if (sheetUnsolved > 0) {
          reasons.push(`${sheetUnsolved} unsolved sheet problems`);
        }

        const failedProblems = sheetProblems
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

        const suggestedProblems = failedProblems.slice(0, 3);

        return {
          topic,
          weaknessScore,
          reasons,
          failedProblems,
          suggestedProblems,
          successRate,
          solved: topicStat.solved,
          attempted: topicStat.attempted,
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
