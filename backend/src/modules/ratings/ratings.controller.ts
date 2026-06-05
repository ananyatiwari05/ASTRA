import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { RatingsService } from './ratings.service';

@Controller('ratings')
export class RatingsController {
  constructor(
    private readonly ratingsService: RatingsService,
  ) {}

  @Get(':userId')
  getRatings(
    @Param('userId') userId: string,
  ) {
    return this.ratingsService.getUserRatings(
      Number(userId),
    );
  }
}