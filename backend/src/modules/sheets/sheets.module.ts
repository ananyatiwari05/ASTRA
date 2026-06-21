import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Problem } from '../problems/entities/problem.entity';
import { ProgressModule } from '../progress/progress.module';
import { UsersModule } from '../users/users.module';
import { SheetProgress } from './entities/sheet-progress.entity';
import { ProblemMap } from './entities/problem-map.entity';
import { SheetsService } from './sheets.service';
import { SheetsController } from './sheets.controller';
import { SheetSyncService } from './sheet-sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Problem, SheetProgress, ProblemMap]),
    ProgressModule,
    UsersModule,
  ],
  controllers: [SheetsController],
  providers: [SheetsService, SheetSyncService],
  exports: [SheetsService, SheetSyncService],
})
export class SheetsModule {}
