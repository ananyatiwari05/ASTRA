import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SheetsService } from './sheets.service';

@Controller('sheets')
export class SheetsController {
  constructor(
    private readonly sheetsService: SheetsService,
  ) {}

  @Get()
  getAllSheets() {
    return this.sheetsService.getAllSheets();
  }

  @Get('user/:userId')
  getUserProgressSummary(@Param('userId') userId: string) {
    return this.sheetsService.getUserProgressSummary(parseInt(userId, 10));
  }

  @Post('manual-check')
  @HttpCode(HttpStatus.OK)
  manualCheck(
    @Body()
    body: {
      userId: number;
      sheetProblemId: number;
      isSolved: boolean;
    },
  ) {
    return this.sheetsService.manualCheck(
      body.userId,
      body.sheetProblemId,
      body.isSolved,
    );
  }

  @Get(':sheetName/problems')
  getSheetProblems(
    @Param('sheetName') sheetName: string,
    @Query('userId') userId?: string,
  ) {
    return this.sheetsService.getSheetProblems(
      sheetName,
      userId ? parseInt(userId, 10) : undefined,
    );
  }

  @Get(':sheetName')
  getSheet(@Param('sheetName') sheetName: string) {
    return this.sheetsService.getSheetByName(sheetName);
  }
}
