import { Module } from '@nestjs/common';
import { LeetcodeController } from './leetcode.controller';
import { LeetcodeService } from './leetcode.service';

@Module({
  controllers: [LeetcodeController],
  providers: [LeetcodeService],
  exports: [LeetcodeService],
})
export class LeetcodeModule {}