import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  async getDashboardData(userId: number) {
    return {
      message: 'Dashboard data',
      userId,
    };
  }
}