import {
  Controller,
  Post,
  Param,
} from '@nestjs/common';

import { CodeforcesService } from './codeforces.service';

@Controller('codeforces')
export class CodeforcesController {
  constructor(
    private readonly codeforcesService: CodeforcesService,
  ) {}

  @Post('sync/:userId')
  async syncUser(@Param('userId') userId: string) {
    return this.codeforcesService.syncByUserId(
      parseInt(userId, 10),
    );
  }
}
