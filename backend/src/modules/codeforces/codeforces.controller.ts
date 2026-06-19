import {
  Controller,
  Post,
  Param,
  NotFoundException,
} from '@nestjs/common';

import { CodeforcesService } from './codeforces.service';
import { UsersService } from '../users/users.service';

@Controller('codeforces')
export class CodeforcesController {
  constructor(
    private readonly codeforcesService: CodeforcesService,
    private readonly usersService: UsersService,
  ) {}

  @Post('sync/:userId')
  async syncUser(
    @Param('userId') userId: string,
  ) {
    const user =
      await this.usersService.findOne(
        parseInt(userId, 10),
      );

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    if (!user.cfHandle) {
      throw new NotFoundException(
        'Codeforces handle not found',
      );
    }

    return this.codeforcesService.syncUser(
      user.cfHandle,
      user,
    );
  }
}