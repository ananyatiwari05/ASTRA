import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    private readonly submissionRepo: Repository<Submission>,

    @InjectRepository(Contest)
    private readonly contestRepo: Repository<Contest>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findUserById(id: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async syncUser(
    handle: string,
    user: User,
  ): Promise<{ message: string }> {
    const submissionsRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`,
    );

    const contestsRes = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${handle}`,
    );

    const submissions = submissionsRes.data.result;
    const contests = contestsRes.data.result;

    for (const sub of submissions) {
      await this.submissionRepo.save({
        user,
        userId: user.id,
        platform: 'codeforces',
        problemId: `${sub.problem.contestId}-${sub.problem.index}`,
        problemName: sub.problem.name,
        verdict: sub.verdict,
        language: sub.programmingLanguage,
        submittedAt: new Date(
          sub.creationTimeSeconds * 1000,
        ),
      });
    }

    for (const contest of contests) {
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
      message: 'Codeforces sync completed successfully',
    };
  }

  async syncByUserId(
    userId: number,
  ): Promise<{ message: string }> {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (!user.cfHandle) {
      throw new NotFoundException(
        'Codeforces handle not found',
      );
    }

    return this.syncUser(user.cfHandle, user);
  }

  async getUserData(handle: string) {
    const response = await axios.get(
      `https://codeforces.com/api/user.info?handles=${handle}`,
    );

    return response.data.result[0];
  }
}