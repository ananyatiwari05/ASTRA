import { Controller, Get, Param } from '@nestjs/common';
import { ContestAnalysisService } from './contest-analysis.service';

@Controller('contest-analysis')
export class ContestAnalysisController {
  constructor(
    private readonly contestAnalysisService: ContestAnalysisService,
  ) {}

  @Get(':userId')
  getContestProgress(@Param('userId') userId: string) {
    return this.contestAnalysisService.getContestProgress(
      parseInt(userId),
    );
  }

  @Get(':userId/rating-trend')
  getRatingTrend(@Param('userId') userId: string) {
    return this.contestAnalysisService.getRatingTrend(
      parseInt(userId),
    );
  }
}