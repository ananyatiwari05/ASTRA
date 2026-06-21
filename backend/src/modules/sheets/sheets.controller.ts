import { Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ProgressService } from '../progress/progress.service';
import { SheetsService } from './sheets.service';
import { SheetSyncService } from './sheet-sync.service';

@Controller('sheets')
export class SheetsController {
  constructor(
    private readonly sheetsService: SheetsService,
    private readonly progressService: ProgressService,
    private readonly sheetSyncService: SheetSyncService,
  ) {}

  @Get()
  getAllSheets() {
    return this.sheetsService.getAllSheets();
  }

  @Get('progress/:userId')
  getSheetProgress(@Param('userId') userId: string) {
    return this.progressService.getAllSheetsProgress(
      parseInt(userId, 10),
    );
  }

  @Post('sync/a2z/:userId')
  syncA2Z(@Param('userId') userId: string) {
    return this.sheetSyncService.syncA2Z(parseInt(userId, 10));
  }

  @Post('sync/daily/:userId')
  syncTLEliminator(@Param('userId') userId: string) {
    return this.sheetSyncService.syncTLEliminator(parseInt(userId, 10));
  }

  @Get(':sheetName/problems')
  getSheetProblems(@Param('sheetName') sheetName: string) {
    return this.sheetsService.getSheetProblems(sheetName);
  }

  @Get(':sheetName')
  getSheet(@Param('sheetName') sheetName: string) {
    return this.sheetsService.getSheetByName(sheetName);
  }
}
