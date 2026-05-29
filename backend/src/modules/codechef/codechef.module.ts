import { Module } from '@nestjs/common';
import { CodechefController } from './codechef.controller';
import { CodechefService } from './codechef.service';

@Module({
  controllers: [CodechefController],
  providers: [CodechefService],
})
export class CodechefModule {}