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
    @Body() body: { cfHandle?: string; ccHandle?: string; lcHandle?: string },
  ) {
    return this.usersService.updateHandles(
      Number(id),
      body.cfHandle ?? '',
      body.ccHandle ?? '',
      body.lcHandle ?? '',
    );
  }

  @Patch(':id/sheet-handles')
  updateSheetHandles(
    @Param('id') id: string,
    @Body()
    body: {
      trackingPreference?: string;
    },
  ) {
    return this.usersService.updateSheetHandles(
      Number(id),
      body.trackingPreference,
    );
  }
}