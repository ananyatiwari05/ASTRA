import { Controller, Get, Param } from '@nestjs/common';
import { LeetcodeService } from './leetcode.service';

@Controller('lc')
export class LeetcodeController {
  constructor(private readonly leetcodeService: LeetcodeService) {}

  @Get(':username')
  getLCData(@Param('username') username: string) {
    return this.leetcodeService.getUserData(username);
  }
}