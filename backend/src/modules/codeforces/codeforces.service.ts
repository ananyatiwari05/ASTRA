import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Submission } from '.././submissions/entities/submission.entity';
import { Contest } from '.././contests/entities/contest.entity';
import { User } from '.././users/entities/user.entity';

@Injectable()
export class CodeforcesService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,

    @InjectRepository(Contest)
    private contestRepo: Repository<Contest>,
  ) {}

  async syncUser(handle: string, user: User) {
    const submissionsRes = await axios.get(
      `https://codeforces.com/api/user.status?handle=${handle}`,
    );

    const contestsRes = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${handle}`,
    );

    for (const sub of submissionsRes.data.result) {
      await this.submissionRepo.save({
        user,
        platform: 'codeforces',
        problemId: `${sub.problem.contestId}-${sub.problem.index}`,
        verdict: sub.verdict,
        contestId: sub.contestId,
        timestamp: sub.creationTimeSeconds,
        programmingLanguage: sub.programmingLanguage,
      });
    }

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
}