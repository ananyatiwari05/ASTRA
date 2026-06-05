import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { SubmissionsService } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Get(':userId')
  getSubmissions(
    @Param('userId') userId: string,
  ) {
    return this.submissionsService.getUserSubmissions(
      Number(userId),
    );
  }
}