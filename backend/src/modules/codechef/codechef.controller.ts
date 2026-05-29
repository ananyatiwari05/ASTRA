import { Controller, Get, Param } from '@nestjs/common';
import { CodechefService } from './codechef.service';

@Controller('cc')
export class CodechefController {
  constructor(private readonly codechefService: CodechefService) {}

  @Get(':handle')
  getCCData(@Param('handle') handle: string) {
    return this.codechefService.getUserData(handle);
  }
}