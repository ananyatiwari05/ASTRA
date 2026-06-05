import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CompetitiveProfile } from './entities/competitive-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompetitiveProfile,
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}