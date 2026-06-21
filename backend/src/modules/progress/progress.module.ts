import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Problem } from '../problems/entities/problem.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { SheetProgress } from '../sheets/entities/sheet-progress.entity';
import { ProblemMap } from '../sheets/entities/problem-map.entity';
import { ProgressService } from './progress.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Problem,
      Submission,
      SheetProgress,
      ProblemMap,
    ]),
  ],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
