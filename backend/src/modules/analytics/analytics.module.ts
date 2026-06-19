import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { RevisionService } from './revision.service';
import { RevisionController } from './revision.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Submission, Problem])],
  providers: [AnalyticsService, RevisionService],
  controllers: [AnalyticsController, RevisionController],
  exports: [AnalyticsService, RevisionService],
})
export class AnalyticsModule {}
