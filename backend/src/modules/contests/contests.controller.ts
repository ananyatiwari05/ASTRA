import { Controller, Get } from '@nestjs/common';
import { ContestsService } from './contests.service';

@Controller('contests')
export class ContestsController {

  constructor(
    private readonly contestsService: ContestsService
  ) {}

  @Get('upcoming')
  getUpcomingContests() {
    return this.contestsService.getUpcomingContests();
  }
}