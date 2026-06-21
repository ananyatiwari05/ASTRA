import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  SheetProgress,
  SheetProgressSource,
} from './entities/sheet-progress.entity';
import { ProblemMap } from './entities/problem-map.entity';

type SheetSyncConfig = {
  sheetId: string;
  range: string;
  sheetName: string;
  source: SheetProgressSource;
};

@Injectable()
export class SheetSyncService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,

    @InjectRepository(SheetProgress)
    private readonly sheetProgressRepo: Repository<SheetProgress>,

    @InjectRepository(ProblemMap)
    private readonly problemMapRepo: Repository<ProblemMap>,
  ) {}

  async syncA2Z(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.a2zEmail) {
      throw new BadRequestException(
        'A2Z email not configured. Add it in profile settings.',
      );
    }

    const result = await this.syncSheet(user, {
      sheetId: this.configService.get<string>('A2Z_SHEET_ID') ?? '',
      range:
        this.configService.get<string>('A2Z_SHEET_RANGE') ??
        'Sheet1!A:ZZ',
      sheetName: 'A2Z',
      source: SheetProgressSource.A2Z,
    });

    await this.usersService.updateA2zLastSynced(userId);

    return result;
  }

  async syncTLEliminator(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.TLEliminatorEmail) {
      throw new BadRequestException(
        'TLE Eliminator email not configured. Add it in profile settings.',
      );
    }

    const result = await this.syncSheet(user, {
      sheetId: this.configService.get<string>('TLE_SHEET_ID') ?? '',
      range:
        this.configService.get<string>('TLE_SHEET_RANGE') ??
        'Sheet1!A:ZZ',
      sheetName: 'TLE',
      source: SheetProgressSource.TLE_ELIMINATOR,
    });

    await this.usersService.updateTleLastSynced(userId);

    return result;
  }

  private async syncSheet(
    user: User,
    config: SheetSyncConfig,
  ) {
    if (!config.sheetId) {
      throw new BadRequestException(
        `${config.sheetName} Google Sheet ID is not configured on the server.`,
      );
    }

    const email =
      config.source === SheetProgressSource.A2Z
        ? user.a2zEmail
        : user.TLEliminatorEmail;

    const rows = await this.fetchSheetValues(
      config.sheetId,
      config.range,
    );

    const solvedIds = this.extractSolvedProblemIds(rows, email!);
    const problemMaps = await this.problemMapRepo.find({
      where: { sheetName: config.sheetName },
    });

    const mapBySheetId = new Map(
      problemMaps.map((entry) => [entry.sheetProblemId, entry]),
    );

    const now = new Date();
    let synced = 0;
    let unmarked = 0;

    for (const mapEntry of problemMaps) {
      const isSolved = solvedIds.has(mapEntry.sheetProblemId);

      await this.sheetProgressRepo.upsert(
        {
          userId: user.id,
          sheetName: config.sheetName,
          problemId: mapEntry.sheetProblemId,
          isSolved,
          solvedAt: isSolved ? now : null,
          source: config.source,
          syncedAt: now,
        },
        ['userId', 'sheetName', 'problemId'],
      );

      if (isSolved) {
        synced++;
      } else {
        unmarked++;
      }
    }

    const unmappedSolved = [...solvedIds].filter(
      (id) => !mapBySheetId.has(id),
    );

    return {
      message: `${config.sheetName} sheet synced successfully`,
      sheetName: config.sheetName,
      source: config.source,
      email,
      solvedCount: synced,
      totalMapped: problemMaps.length,
      unmappedSolvedIds: unmappedSolved,
      remaining: unmarked,
      syncedAt: now,
    };
  }

  private async fetchSheetValues(
    spreadsheetId: string,
    range: string,
  ): Promise<string[][]> {
    const apiKey = this.configService.get<string>(
      'GOOGLE_SHEETS_API_KEY',
    );

    if (!apiKey) {
      throw new BadRequestException(
        'GOOGLE_SHEETS_API_KEY is not configured on the server.',
      );
    }

    try {
      const { data } = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
        { params: { key: apiKey } },
      );

      return (data.values ?? []) as string[][];
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.error?.message
          ? error.response.data.error.message
          : 'Failed to fetch Google Sheet data';

      throw new BadRequestException(message);
    }
  }

  private extractSolvedProblemIds(
    rows: string[][],
    email: string,
  ): Set<string> {
    if (!rows.length) {
      return new Set();
    }

    const normalizedEmail = email.trim().toLowerCase();
    let headerRowIndex = 0;
    let emailColIndex = -1;

    for (let rowIndex = 0; rowIndex < Math.min(rows.length, 20); rowIndex++) {
      const row = rows[rowIndex] ?? [];

      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = String(row[colIndex] ?? '').trim().toLowerCase();

        if (cell === 'email' || cell.includes('email address')) {
          headerRowIndex = rowIndex;
          emailColIndex = colIndex;
          break;
        }
      }

      if (emailColIndex >= 0) break;
    }

    const headerRow = rows[headerRowIndex] ?? [];

    if (emailColIndex < 0) {
      emailColIndex = 0;
    }

    let userRowIndex = -1;

    for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex] ?? [];
      const cellEmail = String(row[emailColIndex] ?? '')
        .trim()
        .toLowerCase();

      if (cellEmail === normalizedEmail) {
        userRowIndex = rowIndex;
        break;
      }
    }

    if (userRowIndex < 0) {
      throw new BadRequestException(
        `No row found for email "${email}" in the sheet.`,
      );
    }

    const userRow = rows[userRowIndex] ?? [];
    const solved = new Set<string>();

    for (let colIndex = 0; colIndex < headerRow.length; colIndex++) {
      if (colIndex === emailColIndex) continue;

      const header = String(headerRow[colIndex] ?? '').trim();
      const value = String(userRow[colIndex] ?? '').trim();

      if (!this.isCheckedValue(value)) continue;

      const problemId = this.extractProblemIdFromHeader(header, colIndex);

      if (problemId) {
        solved.add(problemId);
      }
    }

    return solved;
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

  private extractProblemIdFromHeader(
    header: string,
    columnIndex: number,
  ): string | null {
    if (!header) {
      return String(columnIndex);
    }

    const numberMatch = header.match(/#?\s*(\d+)/);

    if (numberMatch) {
      return numberMatch[1];
    }

    const qMatch = header.match(/Q\s*(\d+)/i);

    if (qMatch) {
      return qMatch[1];
    }

    const normalized = header.trim();

    if (/^\d+$/.test(normalized)) {
      return normalized;
    }

    return normalized || String(columnIndex);
  }
}
