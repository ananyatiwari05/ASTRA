import { Controller, Get, Param } from '@nestjs/common';
import { CodeforcesService } from './codeforces.service';

@Controller('cf')
export class CodeforcesController {
  constructor(private readonly codeforcesService: CodeforcesService) {}

  @Get(':handle')
  async getUser(@Param('handle') handle: string) {
    return this.codeforcesService.getUserData(handle);
  }
}