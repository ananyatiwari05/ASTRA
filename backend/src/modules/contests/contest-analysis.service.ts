import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contest } from './entities/contest.entity';

@Injectable()
export class ContestAnalysisService {
  constructor(
    @InjectRepository(Contest)
    private contestRepo: Repository<Contest>,
  ) {}

  async getContestProgress(userId: number) {
    const contests = await this.contestRepo.find({
      where: { user: { id: userId } },
      order: { contestId: 'ASC' },
    });

    if (!contests.length) return [];

    return contests.map((contest) => ({
      contestId: contest.contestId,
      contestName: contest.contestName,
      rank: contest.rank,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
      delta: contest.newRating - contest.oldRating,
    }));
  }

  async getRatingTrend(userId: number) {
    const contests = await this.contestRepo.find({
      where: { user: { id: userId } },
      order: { contestId: 'ASC' },
    });

    return contests.map((contest) => ({
      contestName: contest.contestName,
      rating: contest.newRating,
    }));
  }
}