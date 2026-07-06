import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Problem } from '../problems/entities/problem.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { ProblemMap } from '../sheets/entities/problem-map.entity';
import { UserSheetProgress } from '../sheets/entities/user-sheet-progress.entity';
import { ProgressService } from './progress.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Problem,
      Submission,
      UserSheetProgress,
      ProblemMap,
    ]),
  ],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
