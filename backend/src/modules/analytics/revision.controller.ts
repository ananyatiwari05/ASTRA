import { Controller, Get, Param, Query } from '@nestjs/common';
import { RevisionService } from './revision.service';

@Controller('revision')
export class RevisionController {
  constructor(private readonly revisionService: RevisionService) {}

  @Get('user/:userId/recommendations')
  async getRevisionRecommendations(
    @Param('userId') userId: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.revisionService.getRevisionRecommendations(
      parseInt(userId, 10),
      parseInt(limit, 10) || 10,
    );
  }

  @Get('user/:userId/weak-topics')
  async getWeakTopicsForRevision(@Param('userId') userId: string) {
    return this.revisionService.getWeakTopicsForRevision(parseInt(userId, 10));
  }
}
