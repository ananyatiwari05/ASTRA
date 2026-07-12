import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';
import { SheetProblem } from '../sheets/entities/sheet-problem.entity';
import { UserSheetProgress } from '../sheets/entities/user-sheet-progress.entity';
import { UnifiedSolveService } from '../unified/unified-solve.service';
import { normalizeTag } from '../../common/utils/tag.util';

@Injectable()
export class RevisionService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,

    @InjectRepository(Problem)
    private problemsRepository: Repository<Problem>,

    @InjectRepository(SheetProblem)
    private sheetProblemRepo: Repository<SheetProblem>,

    @InjectRepository(UserSheetProgress)
    private userSheetProgressRepo: Repository<UserSheetProgress>,

    private readonly unifiedSolveService: UnifiedSolveService,
  ) {}

  async getRevisionQueue(userId: number, limit = 10) {
    const [solvedProblems, topicBreakdown, contestWeaknesses, submissions] =
      await Promise.all([
        this.unifiedSolveService.getUnifiedSolvedProblems(userId),
        this.unifiedSolveService.getTopicBreakdown(userId),
        this.unifiedSolveService.getContestWeaknesses(userId),
        this.submissionsRepository.find({ where: { userId } })
      ]);

    const contestFailureMap = new Map(
      contestWeaknesses.map((entry) => [entry.topic, entry.failures]),
    );

    const problemFailureCount = new Map<string, number>();
    for (const sub of submissions) {
      if (sub.verdict !== 'OK' && sub.verdict !== 'Accepted') {
        const key = `${sub.platform}:${sub.problemId}`;
        problemFailureCount.set(key, (problemFailureCount.get(key) ?? 0) + 1);
      }
    }

    const now = Date.now();
    const queue: any[] = [];

    for (const problem of solvedProblems) {
      const daysSinceSolve = problem.solvedAt
        ? Math.floor(
            (now - problem.solvedAt.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 999;

      const primaryTopic = normalizeTag(problem.tags?.[0] ?? 'general');
      const topicStat = topicBreakdown.find((t) => t.topic === primaryTopic);
      const contestFailures = contestFailureMap.get(primaryTopic) ?? 0;
      const timesFailed = problemFailureCount.get(`${problem.platform}:${problem.problemId}`) ?? 0;

      // 1. Old solved score
      const oldSolvedScore = Math.min(daysSinceSolve * 1.5, 150);

      // 2. Weak topic score
      const successRate = topicStat ? topicStat.successRate : 100;
      const weakTopicScore = (100 - successRate) * 1.5;

      // 3. Contest failed topic score
      const contestFailedScore = Math.min(contestFailures * 20, 100);

      // 4. Hard problem score
      let hardProblemScore = 0;
      const diff = problem.difficulty ?? 0;
      if (diff >= 3 || diff >= 1800) {
        hardProblemScore = 50;
      } else if (diff === 2 || diff >= 1400) {
        hardProblemScore = 25;
      }
      
      // 5. Repeated Mistakes score
      const repeatedMistakeScore = Math.min(timesFailed * 15, 75);

      const priorityScore =
        oldSolvedScore +
        weakTopicScore +
        contestFailedScore +
        hardProblemScore +
        repeatedMistakeScore;

      // Determine priority level
      let priority: 'High' | 'Medium' | 'Low' = 'Low';
      let suggestedDeadline = 'Next week';
      
      if (priorityScore >= 180) {
        priority = 'High';
        suggestedDeadline = 'Today';
      } else if (priorityScore >= 100) {
        priority = 'Medium';
        suggestedDeadline = 'Within 3 days';
      }

      // Determine main reason
      let reason = 'Old solved problem';
      if (timesFailed >= 3) {
        reason = `Repeatedly failed before solving (${timesFailed} times)`;
      } else if (successRate < 50) {
        reason = `Weak in ${primaryTopic.replace(/_/g, ' ')}`;
      } else if (contestFailures >= 2) {
        reason = `Failed in ${contestFailures} contests on this topic`;
      } else if (diff >= 3) {
        reason = `Hard problem drill`;
      } else if (daysSinceSolve >= 30) {
        reason = `Forgotten concept (Not revised in ${daysSinceSolve} days)`;
      }
      
      const estimatedRevisionTime = diff >= 3 ? 45 : diff === 2 ? 30 : 15;
      const confidence = Math.max(10, Math.round(successRate - (timesFailed * 5) - (daysSinceSolve > 30 ? 20 : 0)));

      queue.push({
        problemId: problem.problemId,
        title: problem.title,
        reason,
        topic: primaryTopic,
        priority,
        priorityScore,
        platform: problem.platform,
        url: problem.url,
        difficulty: diff,
        tags: problem.tags,
        lastSolved: problem.solvedAt,
        timesFailed,
        estimatedRevisionTime,
        confidence,
        suggestedDeadline
      });
    }

    return queue
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, limit);
  }

  async getRevisionRecommendations(userId: number, limit = 10) {
    const queue = await this.getRevisionQueue(userId, limit);

    return queue.map((item) => ({
      id: item.problemId,
      problemId: item.problemId,
      title: item.title,
      difficulty: item.difficulty,
      rating: item.difficulty,
      tags: item.tags,
      platform: item.platform,
      url: item.url,
      reason: item.reason,
      topic: item.topic,
      priority: item.priority,
      priorityScore: item.priorityScore,
      lastSolved: item.lastSolved,
      timesFailed: item.timesFailed,
      estimatedRevisionTime: item.estimatedRevisionTime,
      confidence: item.confidence,
      suggestedDeadline: item.suggestedDeadline,
      daysSinceLastAttempt: item.reason.includes('Not revised')
        ? Number(item.reason.match(/\\d+/)?.[0] ?? 0)
        : 0,
    }));
  }

  async getWeakTopicsForRevision(userId: number) {
    const [topicBreakdown, solvedProblems, allProblems, sheetProblems] =
      await Promise.all([
        this.unifiedSolveService.getTopicBreakdown(userId),
        this.unifiedSolveService.getUnifiedSolvedProblems(userId),
        this.problemsRepository.find(),
        this.sheetProblemRepo.find(),
      ]);

    const solvedKeys = new Set(
      solvedProblems.map((p) => `${p.platform}:${p.problemId}`),
    );

    const weakTopics: {
      topic: string;
      successRate: number;
      weaknessPercentage: number;
      problems: {
        id: number | string;
        problemId: string;
        title: string;
        difficulty: number;
        platform: string;
        url: string;
        tags: string[];
      }[];
    }[] = [];

    for (const topicStat of topicBreakdown) {
      if (topicStat.successRate >= 50) continue;

      // Find unsolved problems from both general problems and sheet problems
      const unsolvedProblemsList: {
        id: number | string;
        problemId: string;
        title: string;
        difficulty: number;
        platform: string;
        url: string;
        tags: string[];
      }[] = [];

      // Check sheet problems first
      const unsolvedSheetProblems = sheetProblems.filter((p) => {
        const tags = (p.tags ?? []).map(normalizeTag);
        if (!tags.includes(topicStat.topic)) return false;
        return !solvedKeys.has(`${p.platform}:${p.problemId}`);
      });

      for (const p of unsolvedSheetProblems) {
        let diffNum = 2;
        if (p.difficulty === 'Easy') diffNum = 1;
        else if (p.difficulty === 'Hard') diffNum = 3;

        unsolvedProblemsList.push({
          id: `sheet-${p.id}`,
          problemId: p.problemId,
          title: p.title,
          difficulty: diffNum,
          platform: p.platform,
          url: p.sourceUrl || '',
          tags: p.tags ?? [],
        });
      }

      // If we need more, grab from general catalog problems
      if (unsolvedProblemsList.length < 5) {
        const unsolvedGeneralProblems = allProblems.filter((p) => {
          const tags = (p.tags ?? []).map(normalizeTag);
          if (!tags.includes(topicStat.topic)) return false;
          return !solvedKeys.has(`${p.platform}:${p.problemId}`);
        });

        for (const p of unsolvedGeneralProblems) {
          if (unsolvedProblemsList.length >= 5) break;
          // check if already added
          if (
            unsolvedProblemsList.some(
              (up) =>
                up.problemId === p.problemId && up.platform === p.platform,
            )
          ) {
            continue;
          }

          unsolvedProblemsList.push({
            id: p.id,
            problemId: p.problemId,
            title: p.title,
            difficulty: p.difficulty ?? 2,
            platform: p.platform,
            url: p.url,
            tags: p.tags ?? [],
          });
        }
      }

      weakTopics.push({
        topic: topicStat.topic,
        successRate: topicStat.successRate,
        weaknessPercentage:
          Math.round((100 - topicStat.successRate) * 100) / 100,
        problems: unsolvedProblemsList.slice(0, 5),
      });
    }

    return weakTopics.sort((a, b) => a.successRate - b.successRate);
  }
}
