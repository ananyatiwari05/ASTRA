import { Module } from '@nestjs/common';
import { CodeforcesModule } from './modules/codeforces/codeforces.module';

@Module({
  imports: [CodeforcesModule],
})
export class AppModule {}