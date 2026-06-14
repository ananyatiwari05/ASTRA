import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { RatingsService } from '../ratings/ratings.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { CodeforcesService } from '../codeforces/codeforces.service';
import { LeetcodeService } from '../leetcode/leetcode.service';
import { CodechefService } from '../codechef/codechef.service';

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
) {}
async getDashboardData(userId: number) {
  const user = await this.usersService.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  let cfData: any = null;
let ccData: any = null;
let lcData: any = null;

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

  console.log("CF DATA =", cfData);
  console.log("CC DATA =", ccData);
  console.log("LC DATA =", lcData);

  await this.profilesService.saveProfile({
    userId,

    cfCurrentRating:
      cfData?.user?.cfCurrentRating || 0,

    cfMaxRating:
      cfData?.user?.cfMaxRating || 0,

    cfRank:
      cfData?.user?.cfRank || 'Unrated',

    ccCurrentRating:
      ccData?.user?.cfCurrentRating || 0,

    totalSolved:
      (lcData?.user?.easySolved || 0)
      +
      (lcData?.user?.mediumSolved || 0)
      +
      (lcData?.user?.hardSolved || 0),
  });

  const profile =
    await this.profilesService.findByUserId(
      userId,
    );

  return {
    user: {
      ...user,

      codeforces: cfData?.user || null,

      codechef: ccData?.user || null,

      leetcode: lcData?.user || null,
    },

    profile,

    ratings: [
  ...(cfData?.ratingHistory || []).map((r) => ({
    ...r,
    platform: 'codeforces',
  })),

  ...(ccData?.ratingHistory || []).map((r) => ({
    ...r,
    platform: 'codechef',
  })),

  ...(lcData?.ratingHistory || []).map((r) => ({
    ...r,
    platform: 'leetcode',
  })),
],

    submissions: [
  ...(cfData?.submissions || []).map((s) => ({
    ...s,
    platform: 'codeforces',
  })),

  ...(ccData?.submissions || []).map((s) => ({
    ...s,
    platform: 'codechef',
  })),

  ...(lcData?.submissions || []).map((s) => ({
    ...s,
    platform: 'leetcode',
  })),
],
  };
}
}