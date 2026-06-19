import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';

@Injectable()
export class RevisionService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,

    @InjectRepository(Problem)
    private problemsRepository: Repository<Problem>,
  ) {}

  async getRevisionRecommendations(
    userId: number,
    limit = 10,
  ) {
    const solvedSubmissions =
      await this.submissionsRepository.find({
        where: {
          userId,
          verdict: 'OK',
        },
        order: {
          submittedAt: 'DESC',
        },
      });

    if (!solvedSubmissions.length) {
      return [];
    }

    const solvedProblemIds = solvedSubmissions.map(
      (s) => s.problemId,
    );

    const lastAttemptMap = new Map<string, Date>();

    for (const submission of solvedSubmissions) {
      if (!lastAttemptMap.has(submission.problemId)) {
        lastAttemptMap.set(
          submission.problemId,
          submission.submittedAt,
        );
      }
    }

    const problems = await this.problemsRepository.find({
      where: {
        problemId: In(solvedProblemIds),
      },
    });

    const recommendations: {
      id: number;
      problemId: string;
      title: string;
      difficulty: string;
      tags: string[];
      lastAttemptDate: Date;
      daysSinceLastAttempt: number;
    }[] = [];

    for (const problem of problems) {
      const lastAttempt = lastAttemptMap.get(
        problem.problemId,
      );

      if (!lastAttempt) continue;

      const daysSinceLastAttempt = Math.floor(
        (Date.now() - lastAttempt.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      recommendations.push({
        id: problem.id,
        problemId: problem.problemId,
        title: problem.title,
        difficulty: String(problem.difficulty),
        tags: problem.tags || [],
        lastAttemptDate: lastAttempt,
        daysSinceLastAttempt,
      });
    }

    return recommendations
      .sort(
        (a, b) =>
          b.daysSinceLastAttempt -
          a.daysSinceLastAttempt,
      )
      .slice(0, limit);
  }

  async getWeakTopicsForRevision(userId: number) {
    const submissions =
      await this.submissionsRepository.find({
        where: { userId },
      });

    const topicStats: Record<
      string,
      {
        attempts: number;
        solves: number;
      }
    > = {};

    for (const submission of submissions) {
      const tags = submission.tags || [];

      for (const tag of tags) {
        if (!topicStats[tag]) {
          topicStats[tag] = {
            attempts: 0,
            solves: 0,
          };
        }

        topicStats[tag].attempts++;

        if (submission.verdict === 'OK') {
          topicStats[tag].solves++;
        }
      }
    }

    const weakTopics: {
      topic: string;
      successRate: number;
      problems: Problem[];
    }[] = [];

    for (const [topic, stats] of Object.entries(
      topicStats,
    )) {
      const successRate =
        (stats.solves / stats.attempts) * 100;

      if (successRate < 50) {
        const problems =
          await this.problemsRepository
            .createQueryBuilder('problem')
            .where('problem.tags ILIKE :topic', {
              topic: `%${topic}%`,
            })
            .take(5)
            .getMany();

        weakTopics.push({
          topic,
          successRate,
          problems,
        });
      }
    }

    return weakTopics.sort(
      (a, b) => a.successRate - b.successRate,
    );
  }
}