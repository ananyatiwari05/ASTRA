import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';
import { Contest } from '../contests/entities/contest.entity';
import { SheetProblem } from '../sheets/entities/sheet-problem.entity';
import { UserSheetProgress } from '../sheets/entities/user-sheet-progress.entity';
import { UnifiedSolveService } from './unified-solve.service';
import { ProblemMap } from '../sheets/entities/problem-map.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submission,
      Problem,
      Contest,
      ProblemMap,
      SheetProblem,
      UserSheetProgress,
    ]),
  ],
  providers: [UnifiedSolveService],
  exports: [UnifiedSolveService],
})
export class UnifiedModule { }
