import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RevisionService } from './revision.service';
import { RevisionController } from './revision.controller';

import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submission,
      Problem,
    ]),
  ],
  controllers: [RevisionController],
  providers: [RevisionService],
  exports: [RevisionService],
})
export class RevisionModule {}