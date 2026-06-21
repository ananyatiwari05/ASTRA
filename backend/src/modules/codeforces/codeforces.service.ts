import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { Submission } from '../submissions/entities/submission.entity';
import { Contest } from '../contests/entities/contest.entity';
import { User } from '../users/entities/user.entity';
import { Problem } from '../problems/entities/problem.entity';
import { SubmissionsService } from '../submissions/submissions.service';
import { RatingsService } from '../ratings/ratings.service';
import { UsersService } from '../users/users.service';
import { normalizeTags } from '../../common/utils/tag.util';

@Injectable()
export class CodeforcesService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,

    @InjectRepository(Contest)
    private readonly contestRepo: Repository<Contest>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Problem)
    private readonly problemRepo: Repository<Problem>,

    private readonly submissionsService: SubmissionsService,
    private readonly ratingsService: RatingsService,
    private readonly usersService: UsersService,
  ) {}

  async findUserById(id: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async syncUser(
    handle: string,
    user: User,
  ): Promise<{
    message: string;
    submissionsProcessed: number;
    submissionsAdded: number;
    contestsProcessed: number;
    contestsAdded: number;
    ratingsAdded: number;
  }> {
    let submissionsRes;
    let contestsRes;

    try {
      [submissionsRes, contestsRes] = await Promise.all([
        axios.get(
          `https://codeforces.com/api/user.status?handle=${handle}`,
        ),
        axios.get(
          `https://codeforces.com/api/user.rating?handle=${handle}`,
        ),
      ]);
    } catch {
      throw new BadRequestException(
        'Failed to reach Codeforces API',
      );
    }

    if (submissionsRes.data.status !== 'OK') {
      throw new BadRequestException(
        submissionsRes.data.comment ||
          'Failed to fetch Codeforces submissions',
      );
    }

    if (contestsRes.data.status !== 'OK') {
      throw new BadRequestException(
        contestsRes.data.comment ||
          'Failed to fetch Codeforces rating history',
      );
    }

    const cfProblems = await this.problemRepo.find({
      where: { platform: 'codeforces' },
    });

    const problemTagMap = new Map(
      cfProblems.map((p) => [p.problemId, p.tags ?? []]),
    );

    const cfProblemsetTags =
      await this.fetchCodeforcesProblemTags();

    const beforeCount = await this.submissionRepo.count({
      where: { userId: user.id, platform: 'codeforces' },
    });

    const submissions = submissionsRes.data.result ?? [];
    const submissionsToSave: Partial<Submission>[] = submissions.map(
      (sub: {
        problem: {
          contestId: number;
          index: string;
          name: string;
          rating?: number;
          tags?: string[];
        };
        verdict: string;
        programmingLanguage: string;
        creationTimeSeconds: number;
      }) => {
        const problemId = `${sub.problem.contestId}-${sub.problem.index}`;

        const tags = normalizeTags([
          ...(problemTagMap.get(problemId) ?? []),
          ...(cfProblemsetTags.get(problemId) ?? []),
          ...(sub.problem.tags ?? []),
        ]);

        return {
          userId: user.id,
          platform: 'codeforces',
          problemId,
          problemName: sub.problem.name,
          verdict: sub.verdict,
          language: sub.programmingLanguage,
          submittedAt: new Date(
            sub.creationTimeSeconds * 1000,
          ),
          tags,
          rating: sub.problem.rating ?? null,
        };
      },
    );

    await this.submissionsService.saveSubmissions(
      submissionsToSave,
    );

    const afterCount = await this.submissionRepo.count({
      where: { userId: user.id, platform: 'codeforces' },
    });

    const contests = contestsRes.data.result ?? [];
    let contestsAdded = 0;

    for (const contest of contests) {
      const existing = await this.contestRepo.findOne({
        where: {
          userId: user.id,
          contestId: contest.contestId,
        },
      });

      if (!existing) {
        await this.contestRepo.save({
          userId: user.id,
          user,
          contestId: contest.contestId,
          rank: contest.rank,
          oldRating: contest.oldRating,
          newRating: contest.newRating,
          contestName: contest.contestName,
        });
        contestsAdded++;
      }
    }

    const ratingsToSave = contests.map(
      (contest: {
        contestId: number;
        contestName: string;
        oldRating: number;
        newRating: number;
        rank: number;
        ratingUpdateTimeSeconds: number;
      }) => ({
        userId: user.id,
        platform: 'codeforces',
        contestId: String(contest.contestId),
        contestName: contest.contestName,
        ratingBefore: contest.oldRating,
        ratingAfter: contest.newRating,
        ratingChange:
          contest.newRating - contest.oldRating,
        rank: contest.rank,
        contestTime: new Date(
          contest.ratingUpdateTimeSeconds * 1000,
        ),
      }),
    );

    const ratingsBefore = await this.ratingsService.getUserRatings(
      user.id,
    );

    await this.ratingsService.saveRatings(ratingsToSave);

    await this.usersService.updateCfLastSynced(user.id);

    const ratingsAfter = await this.ratingsService.getUserRatings(
      user.id,
    );

    return {
      message: 'Codeforces sync completed successfully',
      submissionsProcessed: submissions.length,
      submissionsAdded: afterCount - beforeCount,
      contestsProcessed: contests.length,
      contestsAdded,
      ratingsAdded:
        ratingsAfter.length - ratingsBefore.length,
    };
  }

  async syncByUserId(userId: number) {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.cfHandle) {
      throw new NotFoundException(
        'Codeforces handle not found',
      );
    }

    return this.syncUser(user.cfHandle, user);
  }

  private async fetchCodeforcesProblemTags(): Promise<
    Map<string, string[]>
  > {
    try {
      const response = await axios.get(
        'https://codeforces.com/api/problemset.problems',
      );

      if (response.data.status !== 'OK') {
        return new Map();
      }

      const tagMap = new Map<string, string[]>();

      for (const problem of response.data.result.problems ?? []) {
        const problemId = `${problem.contestId}-${problem.index}`;
        tagMap.set(
          problemId,
          normalizeTags(problem.tags ?? []),
        );
      }

      return tagMap;
    } catch {
      return new Map();
    }
  }

  async getUserData(handle: string) {
    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.info?handles=${handle}`,
      );

      if (response.data.status !== 'OK') {
        return {
          success: false,
          message: response.data.comment,
          user: null,
          ratingHistory: [],
          submissions: [],
        };
      }

      const cfUser = response.data.result[0];

      return {
        success: true,
        user: {
          cfHandle: cfUser.handle,
          cfCurrentRating: cfUser.rating ?? 0,
          cfMaxRating: cfUser.maxRating ?? 0,
          cfRank: cfUser.rank ?? 'Unrated',
        },
        ratingHistory: [],
        submissions: [],
      };
    } catch {
      return {
        success: false,
        message: 'Failed to fetch Codeforces data',
        user: null,
        ratingHistory: [],
        submissions: [],
      };
    }
  }
}
