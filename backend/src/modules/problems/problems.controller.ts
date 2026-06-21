import { Controller, Get, Query } from '@nestjs/common';

import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(
    private readonly problemsService: ProblemsService,
  ) {}

  @Get('filter')
  filterProblems(
    @Query('tag') tag?: string,
    @Query('difficulty') difficulty?: string,
    @Query('platform') platform?: string,
    @Query('sheet') sheet?: string,
  ) {
    return this.problemsService.filterProblems({
      tag,
      difficulty,
      platform,
      sheet,
    });
  }
}
