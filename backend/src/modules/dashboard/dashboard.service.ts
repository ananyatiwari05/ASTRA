import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { RatingsService } from '../ratings/ratings.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { CodeforcesService } from '../codeforces/codeforces.service';
import { LeetcodeService } from '../leetcode/leetcode.service';
import { CodechefService } from '../codechef/codechef.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { RevisionService } from '../analytics/revision.service';
import { ProgressService } from '../progress/progress.service';
import { Contest } from '../contests/entities/contest.entity';

@Injectable()
export class DashboardService {
  constructor(
    private usersService: UsersService,
    private profilesService: ProfilesService,
    private ratingsService: RatingsService,
    private submissionsService: SubmissionsService,
    private codeforcesService: CodeforcesService,
    private leetcodeService: LeetcodeService,
    private codechefService: CodechefService,
    private analyticsService: AnalyticsService,
    private revisionService: RevisionService,
    private progressService: ProgressService,
    @InjectRepository(Contest)
    private contestRepo: Repository<Contest>,
  ) {}

  async getDashboardData(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let cfData: Awaited<
      ReturnType<CodeforcesService['getUserData']>
    > | null = null;
    let ccData: Awaited<
      ReturnType<CodechefService['getUserData']>
    > | null = null;
    let lcData: Awaited<
      ReturnType<LeetcodeService['getUserData']>
    > | null = null;

    if (user.cfHandle) {
      cfData = await this.codeforcesService.getUserData(
        user.cfHandle,
      );
    }

    if (user.ccHandle) {
      ccData = await this.codechefService.getUserData(
        user.ccHandle,
      );
    }

    if (user.lcHandle) {
      lcData = await this.leetcodeService.getUserData(
        user.lcHandle,
      );
    }

    await this.profilesService.saveProfile({
      userId,
      cfCurrentRating:
        (cfData?.user?.cfCurrentRating as number) || 0,
      cfMaxRating:
        (cfData?.user?.cfMaxRating as number) || 0,
      cfRank:
        (cfData?.user?.cfRank as string) || 'Unrated',
      ccCurrentRating:
        (ccData?.user?.cfCurrentRating as number) || 0,
      totalSolved:
        ((lcData?.user?.easySolved as number) || 0) +
        ((lcData?.user?.mediumSolved as number) || 0) +
        ((lcData?.user?.hardSolved as number) || 0),
    });

    const profile =
      await this.profilesService.findByUserId(userId);

    const dbRatings =
      await this.ratingsService.getUserRatings(userId);

    const dbSubmissions =
      await this.submissionsService.getUserSubmissions(
        userId,
      );

    const ratingHistory = dbRatings.length
      ? dbRatings.map((rating) => ({
          platform: rating.platform,
          contestName: rating.contestName,
          ratingBefore: rating.ratingBefore,
          ratingAfter: rating.ratingAfter,
          ratingChange: rating.ratingChange,
          rank: rating.rank,
          contestTime: rating.contestTime,
        }))
      : [
          ...(cfData?.ratingHistory ?? []).map((r) => ({
            ...(r as object),
            platform: 'codeforces',
          })),
          ...(ccData?.ratingHistory ?? []).map((r) => ({
            ...(r as object),
            platform: 'codechef',
          })),
          ...(lcData?.ratingHistory ?? []).map((r) => ({
            ...(r as object),
            platform: 'leetcode',
          })),
        ];

    const recentSubmissions = dbSubmissions.length
      ? dbSubmissions.slice(0, 20).map((sub) => ({
          platform: sub.platform,
          time: sub.submittedAt,
          problemName: sub.problemName,
          verdict: sub.verdict,
          language: sub.language,
        }))
      : [
          ...(cfData?.submissions ?? []).map((s) => ({
            ...(s as object),
            platform: 'codeforces',
          })),
          ...(ccData?.submissions ?? []).map((s) => ({
            ...(s as object),
            platform: 'codechef',
          })),
          ...(lcData?.submissions ?? []).map((s) => ({
            ...(s as object),
            platform: 'leetcode',
          })),
        ].slice(0, 20);

    const contests = await this.contestRepo.find({
      where: { userId },
      order: { contestId: 'DESC' },
    });

    const contestStats = {
      totalContests: contests.length,
      bestRank:
        contests.length > 0
          ? Math.min(...contests.map((c) => c.rank))
          : null,
      latestRating:
        contests.length > 0
          ? contests[contests.length - 1].newRating
          : null,
      ratingDelta:
        contests.length > 0
          ? contests[contests.length - 1].newRating -
            contests[contests.length - 1].oldRating
          : 0,
    };

    const [
      weaknesses,
      revisionRecommendations,
      sheetProgress,
    ] = await Promise.all([
      this.analyticsService.getUserWeaknesses(userId),
      this.revisionService.getRevisionRecommendations(
        userId,
        10,
      ),
      this.progressService.getSheetProgress(userId),
    ]);

    return {
      user: {
        ...user,
        codeforces: cfData?.user ?? null,
        codechef: ccData?.user ?? null,
        leetcode: lcData?.user ?? null,
      },
      profile,
      ratings: ratingHistory,
      submissions: recentSubmissions,
      ratingHistory,
      recentSubmissions,
      weaknesses,
      revisionRecommendations,
      contestStats,
      sheetProgress,
    };
  }
}
