import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ContestAnalysisService } from './contest-analysis.service';
import { UpsolvingService } from './upsolving.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly contestAnalysisService: ContestAnalysisService,
    private readonly upsolvingService: UpsolvingService,
  ) {}

  @Get('user/:userId')
  async getUserAnalytics(@Param('userId') userId: string) {
    return this.analyticsService.getUserAnalytics(parseInt(userId, 10));
  }

  @Get('user/:userId/weaknesses')
  async getUserWeaknesses(@Param('userId') userId: string) {
    return this.analyticsService.getDetailedWeaknesses(
      parseInt(userId, 10),
    );
  }

  @Get('user/:userId/topic-stats')
  async getTopicStats(@Param('userId') userId: string) {
    return this.analyticsService.getTopicStats(parseInt(userId, 10));
  }

  @Get('user/:userId/progress-trend')
  async getUserProgressTrend(
    @Param('userId') userId: string,
    @Query('days') days: string = '30',
  ) {
    return this.analyticsService.getUserProgressTrend(
      parseInt(userId, 10),
      parseInt(days, 10) || 30,
    );
  }
  
  @Get('user/:userId/contest-analysis')
  async getContestAnalysis(@Param('userId') userId: string) {
    return this.contestAnalysisService.getContestAnalysis(parseInt(userId, 10));
  }
  
  @Get('user/:userId/upsolving')
  async getUpsolvingQueue(@Param('userId') userId: string) {
    return this.upsolvingService.getUpsolvingQueue(parseInt(userId, 10));
  }
}
