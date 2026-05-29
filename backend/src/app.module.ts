import { Module } from '@nestjs/common';
import { CodeforcesModule } from './modules/codeforces/codeforces.module';
import { CodechefModule } from './modules/codechef/codechef.module';
import { LeetcodeModule } from './modules/leetcode/leetcode.module';

@Module({
  imports: [CodeforcesModule, CodechefModule, LeetcodeModule],
})
export class AppModule {}