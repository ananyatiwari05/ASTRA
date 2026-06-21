import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContestsController } from './contests.controller';
import { ContestsService } from './contests.service';
import { ContestAnalysisController } from './contest-analysis.controller';
import { ContestAnalysisService } from './contest-analysis.service';
import { UpsolveController } from './upsolve.controller';
import { UpsolveService } from './upsolve.service';
import { Contest } from './entities/contest.entity';
import { Problem } from '../problems/entities/problem.entity';
import { Submission } from '../submissions/entities/submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contest, Problem, Submission]),
  ],
  controllers: [
    ContestsController,
    ContestAnalysisController,
    UpsolveController,
  ],
  providers: [ContestsService, ContestAnalysisService, UpsolveService],
  exports: [ContestAnalysisService],
})
export class ContestsModule {}
