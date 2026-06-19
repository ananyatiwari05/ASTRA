import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Submission)
    private submissionsRepository: Repository<Submission>,

    @InjectRepository(Problem)
    private problemsRepository: Repository<Problem>,
  ) {}

  async getUserWeaknesses(userId: number) {
    const submissions = await this.submissionsRepository.find({
      where: { userId },
    });

    const topicStats: Record<
      string,
      {
        attemptCount: number;
        solveCount: number;
      }
    > = {};

    for (const submission of submissions) {
      const tags = submission.tags || [];

      for (const tag of tags) {
        if (!topicStats[tag]) {
          topicStats[tag] = {
            attemptCount: 0,
            solveCount: 0,
          };
        }

        topicStats[tag].attemptCount++;

        if (submission.verdict === 'OK') {
          topicStats[tag].solveCount++;
        }
      }
    }

    const weaknesses: {
  topic: string;
  attemptCount: number;
  solveCount: number;
  successRate: number;
  recommendedProblems: number;
}[] = [];

    for (const [topic, stats] of Object.entries(topicStats)) {
      const successRate =
        stats.attemptCount > 0
          ? (stats.solveCount / stats.attemptCount) * 100
          : 0;

      const relatedProblems = await this.problemsRepository
        .createQueryBuilder('problem')
        .where('problem.tags ILIKE :topic', {
          topic: `%${topic}%`,
        })
        .getMany();

      weaknesses.push({
        topic,
        attemptCount: stats.attemptCount,
        solveCount: stats.solveCount,
        successRate,
        recommendedProblems: relatedProblems.length,
      });
    }

    return weaknesses.sort(
      (a, b) => a.successRate - b.successRate,
    );
  }

  async getTopicStats(userId: number) {
    const submissions = await this.submissionsRepository.find({
      where: { userId },
    });

    const topicStats: Record<
      string,
      {
        attempts: number;
        successes: number;
        failures: number;
        ratings: number[];
      }
    > = {};

    for (const submission of submissions) {
      const tags = submission.tags || [];

      for (const tag of tags) {
        if (!topicStats[tag]) {
          topicStats[tag] = {
            attempts: 0,
            successes: 0,
            failures: 0,
            ratings: [],
          };
        }

        topicStats[tag].attempts++;

        if (submission.verdict === 'OK') {
          topicStats[tag].successes++;
        } else {
          topicStats[tag].failures++;
        }

        if (submission.rating) {
          topicStats[tag].ratings.push(submission.rating);
        }
      }
    }

    const stats: {
  topic: string;
  totalAttempts: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  averageRating: number;
}[] = [];

    for (const [topic, data] of Object.entries(topicStats)) {
      const successRate =
        data.attempts > 0
          ? (data.successes / data.attempts) * 100
          : 0;

      const averageRating =
        data.ratings.length > 0
          ? data.ratings.reduce((a, b) => a + b, 0) /
            data.ratings.length
          : 0;

      stats.push({
        topic,
        totalAttempts: data.attempts,
        successCount: data.successes,
        failureCount: data.failures,
        successRate,
        averageRating,
      });
    }

    return stats.sort(
      (a, b) => b.totalAttempts - a.totalAttempts,
    );
  }

  async getUserProgressTrend(
    userId: number,
    days = 30,
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const submissions = await this.submissionsRepository.find({
      where: {
        userId,
        submittedAt: MoreThan(startDate),
      },
      order: {
        submittedAt: 'ASC',
      },
    });

    const dailyStats: Record<
      string,
      {
        submissionCount: number;
        acceptedCount: number;
      }
    > = {};

    for (const submission of submissions) {
      const dateStr = submission.submittedAt
        .toISOString()
        .split('T')[0];

      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = {
          submissionCount: 0,
          acceptedCount: 0,
        };
      }

      dailyStats[dateStr].submissionCount++;

      if (submission.verdict === 'OK') {
        dailyStats[dateStr].acceptedCount++;
      }
    }

    return Object.entries(dailyStats).map(
      ([date, stats]) => ({
        date,
        ...stats,
      }),
    );
  }
}