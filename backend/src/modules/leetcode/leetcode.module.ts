import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeetcodeController } from './leetcode.controller';
import { LeetcodeService } from './leetcode.service';
import { Submission } from '../submissions/entities/submission.entity';
import { User } from '../users/entities/user.entity';
import { SubmissionsModule } from '../submissions/submissions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, User]),
    SubmissionsModule,
    UsersModule,
  ],
  controllers: [LeetcodeController],
  providers: [LeetcodeService],
  exports: [LeetcodeService],
})
export class LeetcodeModule {}