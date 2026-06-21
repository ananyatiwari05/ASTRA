import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';
import { UnifiedSolveService } from '../unified/unified-solve.service';
import { normalizeTag } from '../../common/utils/tag.util';

@Injectable()
export class RevisionService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,

    @InjectRepository(Problem)
    private problemsRepository: Repository<Problem>,

    private readonly unifiedSolveService: UnifiedSolveService,
  ) {}

  async getRevisionQueue(userId: number, limit = 10) {
    const [solvedProblems, topicBreakdown, contestWeaknesses] =
      await Promise.all([
        this.unifiedSolveService.getUnifiedSolvedProblems(userId),
        this.unifiedSolveService.getTopicBreakdown(userId),
        this.unifiedSolveService.getContestWeaknesses(userId),
      ]);

    const weakTopicSet = new Set(
      topicBreakdown
        .filter((topic) => topic.successRate < 50)
        .map((topic) => topic.topic),
    );

    const contestFailureMap = new Map(
      contestWeaknesses.map((entry) => [entry.topic, entry.failures]),
    );

    const now = Date.now();
    const queue: {
      problemId: string;
      title: string;
      reason: string;
      topic: string;
      priority: number;
      platform: string;
      url: string;
      difficulty: number;
      tags: string[];
    }[] = [];

    for (const problem of solvedProblems) {
      const daysSinceSolve = problem.solvedAt
        ? Math.floor(
            (now - problem.solvedAt.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 999;

      const primaryTopic = normalizeTag(problem.tags?.[0] ?? 'general');
      let reason = '';
      let priority = 0;

      if (daysSinceSolve >= 30) {
        reason = `Not revised in ${daysSinceSolve} days`;
        priority += daysSinceSolve;
      }

      if (weakTopicSet.has(primaryTopic)) {
        reason = reason || `Weak in ${primaryTopic.replace(/_/g, ' ')}`;
        priority += 100 - (topicBreakdown.find((t) => t.topic === primaryTopic)?.successRate ?? 0);
      }

      const contestFailures = contestFailureMap.get(primaryTopic) ?? 0;

      if (contestFailures >= 2) {
        reason =
          reason || `Failed in ${contestFailures} contests`;
        priority += contestFailures * 25;
      }

      const topicStat = topicBreakdown.find(
        (entry) => entry.topic === primaryTopic,
      );

      if (topicStat && topicStat.successRate < 40) {
        reason = reason || 'Low success rate';
        priority += 50;
      }

      if (!reason) continue;

      queue.push({
        problemId: problem.problemId,
        title: problem.title,
        reason,
        topic: primaryTopic,
        priority,
        platform: problem.platform,
        url: problem.url,
        difficulty: problem.difficulty,
        tags: problem.tags,
      });
    }

    return queue
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit)
      .map(({ priority, ...rest }) => ({
        ...rest,
        priority,
      }));
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
      daysSinceLastAttempt: item.reason.includes('Not revised')
        ? Number(item.reason.match(/\d+/)?.[0] ?? 0)
        : 0,
      priorityScore: item.priority,
    }));
  }

  async getWeakTopicsForRevision(userId: number) {
    const [topicBreakdown, solvedProblems, allProblems] =
      await Promise.all([
        this.unifiedSolveService.getTopicBreakdown(userId),
        this.unifiedSolveService.getUnifiedSolvedProblems(userId),
        this.problemsRepository.find(),
      ]);

    const solvedKeys = new Set(
      solvedProblems.map((p) => `${p.platform}:${p.problemId}`),
    );

    const weakTopics: {
      topic: string;
      successRate: number;
      weaknessPercentage: number;
      problems: {
        id: number;
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

      const unsolved = allProblems
        .filter((problem) => {
          const tags = (problem.tags ?? []).map(normalizeTag);
          if (!tags.includes(topicStat.topic)) return false;
          return !solvedKeys.has(
            `${problem.platform}:${problem.problemId}`,
          );
        })
        .slice(0, 5)
        .map((problem) => ({
          id: problem.id,
          problemId: problem.problemId,
          title: problem.title,
          difficulty: problem.difficulty,
          platform: problem.platform,
          url: problem.url,
          tags: problem.tags ?? [],
        }));

      weakTopics.push({
        topic: topicStat.topic,
        successRate: topicStat.successRate,
        weaknessPercentage:
          Math.round((100 - topicStat.successRate) * 100) / 100,
        problems: unsolved,
      });
    }

    return weakTopics.sort((a, b) => a.successRate - b.successRate);
  }
}
