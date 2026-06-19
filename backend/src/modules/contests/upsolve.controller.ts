import { Controller, Get, Param } from '@nestjs/common';
import { UpsolveService } from './upsolve.service';

@Controller('upsolve')
export class UpsolveController {
  constructor(
    private readonly upsolveService: UpsolveService,
  ) {}

  @Get(':userId')
  getUpsolve(@Param('userId') userId: string) {
    return this.upsolveService.generateUpsolveQueue(
      parseInt(userId),
    );
  }
}