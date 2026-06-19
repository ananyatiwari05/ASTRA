import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CodeforcesService } from './codeforces.service';
import { CodeforcesController } from './codeforces.controller';

import { Submission } from '../submissions/entities/submission.entity';
import { Contest } from '../contests/entities/contest.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submission,
      Contest,
      User,
    ]),
    UsersModule,
  ],
  controllers: [CodeforcesController],
  providers: [CodeforcesService],

  // IMPORTANT
  exports: [CodeforcesService],
})
export class CodeforcesModule {}