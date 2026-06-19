import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profile.module';
import { RatingsModule } from '../ratings/ratings.module';
import { CodeforcesModule } from '../codeforces/codeforces.module';
import { CodechefModule } from '../codechef/codechef.module';
import { LeetcodeModule } from '../leetcode/leetcode.module';
import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [
    UsersModule,
    ProfilesModule,
    RatingsModule,
    SubmissionsModule,
    CodeforcesModule,
    LeetcodeModule,
    CodechefModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }