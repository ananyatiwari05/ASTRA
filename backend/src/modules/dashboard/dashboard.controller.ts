import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get(':userId')
  getDashboard(
    @Param('userId') userId: string,
  ) {
    return this.dashboardService.getDashboardData(
      Number(userId),
    );
  }
}