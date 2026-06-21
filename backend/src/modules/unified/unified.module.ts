import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';
import { Contest } from '../contests/entities/contest.entity';
import { SheetProgress } from '../sheets/entities/sheet-progress.entity';
import { ProblemMap } from '../sheets/entities/problem-map.entity';
import { UnifiedSolveService } from './unified-solve.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submission,
      Problem,
      Contest,
      SheetProgress,
      ProblemMap,
    ]),
  ],
  providers: [UnifiedSolveService],
  exports: [UnifiedSolveService],
})
export class UnifiedModule {}
