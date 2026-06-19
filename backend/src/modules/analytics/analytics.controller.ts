import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('user/:userId/weaknesses')
  async getUserWeaknesses(@Param('userId') userId: string) {
    return this.analyticsService.getUserWeaknesses(parseInt(userId, 10));
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
}
