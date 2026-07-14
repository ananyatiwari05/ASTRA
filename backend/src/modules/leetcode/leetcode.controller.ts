import { Controller, Get, Post, Param } from '@nestjs/common';
import { LeetcodeService } from './leetcode.service';

@Controller('lc')
export class LeetcodeController {
  constructor(private readonly leetcodeService: LeetcodeService) {}

  @Get(':username')
  getLCData(@Param('username') username: string) {
    return this.leetcodeService.getUserData(username);
  }

  @Post('sync/:userId')
  async syncUser(@Param('userId') userId: string) {
    return this.leetcodeService.syncByUserId(
      parseInt(userId, 10),
    );
  }
}