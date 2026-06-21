import { Module } from '@nestjs/common';
import { CodeforcesModule } from './modules/codeforces/codeforces.module';
import { CodechefModule } from './modules/codechef/codechef.module';
import { LeetcodeModule } from './modules/leetcode/leetcode.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profile.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ContestsModule } from './modules/contests/contests.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { RevisionModule } from './modules/analytics/revision.module';
import { ProblemsModule } from './modules/problems/problems.module';
import { SheetsModule } from './modules/sheets/sheets.module';

@Module({
  imports: [
    CodeforcesModule,
    CodechefModule,
    LeetcodeModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    RatingsModule,
    SubmissionsModule,
    DashboardModule,
    ContestsModule,
    AnalyticsModule,
    RevisionModule,
    ProblemsModule,
    SheetsModule,
  ],
})
export class AppModule {}
