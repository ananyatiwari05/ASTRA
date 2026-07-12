import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Problem } from '../problems/entities/problem.entity';
import { ProgressModule } from '../progress/progress.module';
import { UsersModule } from '../users/users.module';
import { ProblemMap } from './entities/problem-map.entity';
import { SheetProblem } from './entities/sheet-problem.entity';
import { UserSheetProgress } from './entities/user-sheet-progress.entity';
import { SheetsService } from './sheets.service';
import { SheetsController } from './sheets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Problem,
      ProblemMap,
      SheetProblem,
      UserSheetProgress,
    ]),
    ProgressModule,
    UsersModule,
  ],
  controllers: [SheetsController],
  providers: [SheetsService],
  exports: [SheetsService, TypeOrmModule],
})
export class SheetsModule { }
