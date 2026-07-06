import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SheetProblem } from './entities/sheet-problem.entity';
import { UserSheetProgress } from './entities/user-sheet-progress.entity';

@Injectable()
export class SheetsSyncService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,

    @InjectRepository(SheetProblem)
    private readonly sheetProblemRepo: Repository<SheetProblem>,

    @InjectRepository(UserSheetProgress)
    private readonly userSheetProgressRepo: Repository<UserSheetProgress>,
  ) { }

  private getSheetsClient() {
    const clientEmail =
      this.configService.get<string>('GOOGLE_CLIENT_EMAIL') ||
      process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey =
      this.configService.get<string>('GOOGLE_PRIVATE_KEY') ||
      process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      throw new BadRequestException(
        'Google Sheets service account email (GOOGLE_CLIENT_EMAIL) or private key (GOOGLE_PRIVATE_KEY) is not configured in .env',
      );
    }

    // Replace literal newlines if they are escaped as string
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return google.sheets({ version: 'v4', auth });
  }

  private extractSheetId(url: string): string {
    if (!url) {
      throw new BadRequestException('Google Sheet URL is empty');
    }
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new BadRequestException(
        'Invalid Google Sheet URL. Could not extract spreadsheet ID.',
      );
    }
    return match[1];
  }

  async syncA2Z(userId: number) {
    throw new BadRequestException('Google Sheets integration is no longer supported. Please use manual tracking.');
  }

  async syncTLE31(userId: number) {
    throw new BadRequestException('Google Sheets integration is no longer supported. Please use manual tracking.');
  }

  private async fetchSolvedFromGoogleSheet(
    spreadsheetId: string,
    email: string,
    sheetNameType: 'A2Z' | 'TLE31',
  ): Promise<Set<number>> {
    const sheetsClient = this.getSheetsClient();

    let spreadsheet;
    try {
      spreadsheet = await sheetsClient.spreadsheets.get({ spreadsheetId });
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to access Google Sheet: ${error.message || 'Is it shared with the service account?'}. Please ensure the sheet is shared with viewer access to your service account email.`,
      );
    }

    const firstSheetName =
      spreadsheet.data.sheets?.[0]?.properties?.title || 'Sheet1';

    let response;
    try {
      response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId,
        range: `${firstSheetName}!A:ZZ`,
      });
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to read sheet data: ${error.message}`,
      );
    }

    const rows = response.data.values as string[][] | undefined;
    if (!rows || rows.length === 0) {
      throw new BadRequestException('The sheet contains no data.');
    }

    return this.parseSheetRows(rows, email, sheetNameType);
  }

  private parseSheetRows(
    rows: string[][],
    userEmail: string,
    sheetNameType: 'A2Z' | 'TLE31',
  ): Set<number> {
    const solvedIndices = new Set<number>();
    const normalizedEmail = userEmail.trim().toLowerCase();

    // 1. Detect Layout Mode
    // Layout A: Grid style. Rows = users (with email), Columns = problem columns.
    // Layout B: Row-per-problem style. Rows = problems. Solved column containing checkboxes.
    let emailColIndex = -1;
    let headerRowIndex = 0;

    // Scan first 10 rows for "email" column
    for (let r = 0; r < Math.min(rows.length, 10); r++) {
      const row = rows[r] || [];
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] || '').trim().toLowerCase();
        if (
          val === 'email' ||
          val.includes('email address') ||
          val === 'emails'
        ) {
          emailColIndex = c;
          headerRowIndex = r;
          break;
        }
      }
      if (emailColIndex >= 0) break;
    }

    if (emailColIndex >= 0) {
      // Grid style layout: rows are users, columns are problems
      const headerRow = rows[headerRowIndex] || [];
      let userRowIndex = -1;

      for (let r = headerRowIndex + 1; r < rows.length; r++) {
        const row = rows[r] || [];
        const cellEmail = String(row[emailColIndex] || '')
          .trim()
          .toLowerCase();
        if (cellEmail === normalizedEmail) {
          userRowIndex = r;
          break;
        }
      }

      if (userRowIndex < 0) {
        throw new BadRequestException(
          `No row matching email "${userEmail}" was found in the sheet.`,
        );
      }

      const userRow = rows[userRowIndex] || [];
      for (let c = 0; c < headerRow.length; c++) {
        if (c === emailColIndex) continue;
        const header = String(headerRow[c] || '').trim();
        const value = String(userRow[c] || '').trim();

        if (this.isCheckedValue(value)) {
          const probNum = this.extractProblemNumber(header, c);
          if (probNum !== null) {
            solvedIndices.add(probNum);
          }
        }
      }
    } else {
      // Row-per-problem style layout: each row represents a problem, with columns for "solved", "title", etc.
      let solvedColIndex = -1;
      let probNumColIndex = -1;
      let titleColIndex = -1;

      // Find the header row by looking for "status", "solved", "title", etc.
      let layoutHeaderRowIndex = 0;
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const row = rows[r] || [];
        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] || '').trim().toLowerCase();
          if (
            val === 'solved' ||
            val === 'status' ||
            val === 'done' ||
            val === 'check' ||
            val === 'completed' ||
            val === 'is solved' ||
            val === 'verdict'
          ) {
            solvedColIndex = c;
            layoutHeaderRowIndex = r;
          }
          if (
            val === 'number' ||
            val === '#' ||
            val === 'id' ||
            val === 'no' ||
            val === 'problem number'
          ) {
            probNumColIndex = c;
          }
          if (
            val === 'title' ||
            val === 'problem' ||
            val === 'problem name'
          ) {
            titleColIndex = c;
          }
        }
        if (solvedColIndex >= 0) break;
      }

      // Fallback indices if not explicitly named
      if (solvedColIndex < 0) solvedColIndex = 0; // Default first col
      if (probNumColIndex < 0) probNumColIndex = 1;
      if (titleColIndex < 0) titleColIndex = 2;

      for (let r = layoutHeaderRowIndex + 1; r < rows.length; r++) {
        const row = rows[r] || [];
        if (row.length === 0) continue;
        const statusVal = String(row[solvedColIndex] || '').trim();
        const probNumVal = String(row[probNumColIndex] || '').trim();

        if (this.isCheckedValue(statusVal)) {
          // Parse problem number from the sheet row (e.g. "1", "Q1", or row index)
          let probNum = parseInt(probNumVal, 10);
          if (isNaN(probNum)) {
            // fallback to using row number (1-based from start of problems)
            probNum = r - layoutHeaderRowIndex;
          }
          solvedIndices.add(probNum);
        }
      }
    }

    return solvedIndices;
  }

  private isCheckedValue(value: string): boolean {
    const normalized = value.trim().toUpperCase();
    return (
      normalized === 'TRUE' ||
      normalized === 'YES' ||
      normalized === 'Y' ||
      normalized === 'X' ||
      normalized === '✓' ||
      normalized === '✔' ||
      normalized === '1' ||
      normalized === 'DONE'
    );
  }

  private extractProblemNumber(
    header: string,
    colIndex: number,
  ): number | null {
    if (!header) return colIndex;
    const match = header.match(/#?\s*(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    const num = parseInt(header, 10);
    if (!isNaN(num)) return num;
    return colIndex;
  }

  private async saveProgress(
    user: User,
    sheetName: string,
    solvedProblemNumbers: Set<number>,
  ) {
    const problems = await this.sheetProblemRepo.find({
      where: { sheetName },
    });

    const now = new Date();
    let syncedSolved = 0;

    for (const problem of problems) {
      const isSolved = solvedProblemNumbers.has(problem.problemNumber);

      // Fetch existing progress
      let progress = await this.userSheetProgressRepo.findOne({
        where: { userId: user.id, sheetProblemId: problem.id },
      });

      if (!progress) {
        progress = this.userSheetProgressRepo.create({
          userId: user.id,
          sheetProblemId: problem.id,
          sheetName: problem.sheetName,
          isSolved,
          solvedAt: isSolved ? now : null,
          syncSource: 'api',
        });
      } else {
        progress.isSolved = isSolved;
        if (isSolved && !progress.solvedAt) {
          progress.solvedAt = now;
        } else if (!isSolved) {
          progress.solvedAt = null;
        }
        progress.syncSource = 'api';
      }

      await this.userSheetProgressRepo.save(progress);
      if (isSolved) {
        syncedSolved++;
      }
    }

    return {
      message: `${sheetName} sheet synced successfully via API.`,
      sheetName,
      solvedCount: syncedSolved,
      totalCount: problems.length,
      syncedAt: now,
    };
  }
}
