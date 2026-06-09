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
const user =
  await this.usersService.findById(userId);

if (!user) {
  throw new Error('User not found');
}

let cfData: any = null;
let lcData: any = null;
let ccData: any = null;

//forces 
if (user.cfHandle) {
  cfData =
    await this.codeforcesService.getUserData(
      user.cfHandle,
    );
}

//chef
if (user.ccHandle) {
  ccData =
    await this.codechefService.getUserData(
      user.ccHandle,
    );
}

//lc
if (user.lcHandle) {
  lcData =
    await this.leetcodeService.getUserData(
      user.lcHandle,
    );
}
console.log('Saving profile');
await this.profilesService.saveProfile({

  userId,

  cfCurrentRating:
    cfData?.user?.rating,

  cfMaxRating:
    cfData?.user?.maxRating,

  cfRank:
    cfData?.user?.rank,

  ccCurrentRating:
    ccData?.user?.rating,

  totalSolved:
    (
      (lcData?.user?.easySolved || 0)
      +
      (lcData?.user?.mediumSolved || 0)
      +
      (lcData?.user?.hardSolved || 0)
    ),
});

if (cfData?.ratings?.length) {

  const ratings =
    cfData.ratings.map((contest) => ({
      userId,

      platform: 'CODEFORCES',

      contestId:
        String(contest.contestId),

      contestName:
        contest.contestName,

      ratingBefore:
        contest.oldRating,

      ratingAfter:
        contest.newRating,

      ratingChange:
        contest.newRating -
        contest.oldRating,

      rank:
        contest.rank,

      contestTime:
        new Date(
          contest.ratingUpdateTimeSeconds * 1000
        ),
    }));
console.log('Saving ratings');
  await this.ratingsService.saveRatings(
    ratings,
  );
}

if (cfData?.submissions?.length) {

  const submissionRecords =
    cfData.submissions.map((sub) => ({
      userId,

      platform: 'CODEFORCES',

      problemId:
        `${sub.problem.contestId}-${sub.problem.index}`,

      problemName:
        sub.problem.name,

      verdict:
        sub.verdict,

      language:
        sub.programmingLanguage,

      submittedAt:
        new Date(
          sub.creationTimeSeconds * 1000
        ),
    }));
console.log('Saving submissions');
  await this.submissionsService.saveSubmissions(
    submissionRecords,
  );
}

const profile =
  await this.profilesService.findByUserId(
    userId,
  );

const ratings =
  await this.ratingsService.getUserRatings(
    userId,
  );

const submissions =
  await this.submissionsService.getUserSubmissions(
    userId,
  );

return {
  user,
  profile,
  ratingHistory: ratings,
  submissions,
};
}
}