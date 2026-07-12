import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';
import { Contest } from '../contests/entities/contest.entity';
import { SheetProblem } from '../sheets/entities/sheet-problem.entity';
import { UserSheetProgress } from '../sheets/entities/user-sheet-progress.entity';
import { UnifiedModule } from '../unified/unified.module';
import { SheetsModule } from '../sheets/sheets.module';

import { ContestAnalysisService } from './contest-analysis.service';
import { UpsolvingService } from './upsolving.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Submission,
      Problem,
      Contest,
      SheetProblem,
      UserSheetProgress,
    ]),
    UnifiedModule,
    SheetsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ContestAnalysisService, UpsolvingService],
  exports: [AnalyticsService, ContestAnalysisService, UpsolvingService],
})
export class AnalyticsModule {}
