import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { Submission } from '../submissions/entities/submission.entity';
import { Contest } from '../contests/entities/contest.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CodeforcesService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,

    @InjectRepository(Contest)
    private contestRepo: Repository<Contest>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async syncUser(handle: string, user: User) {
    const submissionsRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`,
    );

    const contestsRes = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${handle}`,
    );

    // Save submissions
    for (const sub of submissionsRes.data.result) {
      await this.submissionRepo.save({
        user,
        userId: user.id,
        platform: 'codeforces',
        problemId: `${sub.problem.contestId}-${sub.problem.index}`,
        problemName: sub.problem.name,
        verdict: sub.verdict,
        language: sub.programmingLanguage,
        submittedAt: new Date(sub.creationTimeSeconds * 1000),
      });
    }

    // Save contests
    for (const contest of contestsRes.data.result) {
      await this.contestRepo.save({
        user,
        contestId: contest.contestId,
        rank: contest.rank,
        oldRating: contest.oldRating,
        newRating: contest.newRating,
        contestName: contest.contestName,
      });
    }

    return {
      message: 'Sync complete',
    };
  }

  async syncByUserId(userId: number) {
    const user = await this.findOne(userId);

    if (!user || !user.cfHandle) {
      throw new Error('User or Codeforces handle not found');
    }

    return this.syncUser(user.cfHandle, user);
  }
}