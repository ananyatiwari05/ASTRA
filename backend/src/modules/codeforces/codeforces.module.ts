import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CodeforcesService } from './codeforces.service';
import { CodeforcesController } from './codeforces.controller';

import { Submission } from '../submissions/entities/submission.entity';
import { Contest } from '../contests/entities/contest.entity';
import { User } from '../users/entities/user.entity';
import { Problem } from '../problems/entities/problem.entity';
import { UsersModule } from '../users/users.module';
import { SubmissionsModule } from '../submissions/submissions.module';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submission,
      Contest,
      User,
      Problem,
    ]),
    UsersModule,
    SubmissionsModule,
    RatingsModule,
  ],
  controllers: [CodeforcesController],
  providers: [CodeforcesService],
  exports: [CodeforcesService],
})
export class CodeforcesModule {}
