import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findById(Number(id));
  }

  @Patch(':id/handles')
  updateHandles(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.usersService.updateHandles(
      Number(id),
      body.cfHandle,
      body.ccHandle,
      body.lcHandle,
    );
  }
}