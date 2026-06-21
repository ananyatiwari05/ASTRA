import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profile.module';
import { RatingsModule } from '../ratings/ratings.module';
import { CodeforcesModule } from '../codeforces/codeforces.module';
import { CodechefModule } from '../codechef/codechef.module';
import { LeetcodeModule } from '../leetcode/leetcode.module';
import { SubmissionsModule } from '../submissions/submissions.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { RevisionModule } from '../analytics/revision.module';
import { ProgressModule } from '../progress/progress.module';
import { Contest } from '../contests/entities/contest.entity';

@Module({
  imports: [
    UsersModule,
    ProfilesModule,
    RatingsModule,
    SubmissionsModule,
    CodeforcesModule,
    LeetcodeModule,
    CodechefModule,
    AnalyticsModule,
    RevisionModule,
    ProgressModule,
    TypeOrmModule.forFeature([Contest]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
