import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SheetProblem } from './entities/sheet-problem.entity';
import { UserSheetProgress } from './entities/user-sheet-progress.entity';

@Injectable()
export class SheetsService {
  constructor(
    @InjectRepository(SheetProblem)
    private readonly sheetProblemRepo: Repository<SheetProblem>,

    @InjectRepository(UserSheetProgress)
    private readonly userSheetProgressRepo: Repository<UserSheetProgress>,
  ) {}

  async getAllSheets() {
    const a2zTotal = await this.sheetProblemRepo.count({
      where: { sheetName: 'A2Z' },
    });
    const tleTotal = await this.sheetProblemRepo.count({
      where: { sheetName: 'TLE31' },
    });

    return [
      { name: 'A2Z', totalProblems: a2zTotal },
      { name: 'TLE31', totalProblems: tleTotal },
    ];
  }

  async getSheetByName(sheetName: string) {
    const problems = await this.sheetProblemRepo.find({
      where: { sheetName },
      order: { orderIndex: 'ASC' },
    });
    const tags = new Set<string>();
    for (const p of problems) {
      if (p.tags) {
        p.tags.forEach((t) => tags.add(t));
      }
    }

    return {
      name: sheetName,
      totalProblems: problems.length,
      topics: Array.from(tags).sort(),
    };
  }

  async getSheetProblems(sheetName: string, userId?: number) {
    const problems = await this.sheetProblemRepo.find({
      where: { sheetName },
      order: { orderIndex: 'ASC' },
    });

    if (!userId) {
      return problems.map((p) => ({
        ...p,
        solved: false,
        solvedAt: null,
        syncSource: null,
      }));
    }

    const progressList = await this.userSheetProgressRepo.find({
      where: { userId, sheetName },
    });

    const progressMap = new Map(
      progressList.map((prog) => [prog.sheetProblemId, prog]),
    );

    return problems.map((p) => {
      const prog = progressMap.get(p.id);
      return {
        ...p,
        solved: prog ? prog.isSolved : false,
        solvedAt: prog ? prog.solvedAt : null,
        syncSource: prog ? prog.syncSource : null,
      };
    });
  }

  async getUserProgressSummary(userId: number) {
    const [a2zTotal, tle31Total] = await Promise.all([
      this.sheetProblemRepo.count({ where: { sheetName: 'A2Z' } }),
      this.sheetProblemRepo.count({ where: { sheetName: 'TLE31' } }),
    ]);

    const [a2zSolved, tle31Solved] = await Promise.all([
      this.userSheetProgressRepo.count({
        where: { userId, sheetName: 'A2Z', isSolved: true },
      }),
      this.userSheetProgressRepo.count({
        where: { userId, sheetName: 'TLE31', isSolved: true },
      }),
    ]);

    const a2zProgress =
      a2zTotal > 0 ? Math.round((a2zSolved / a2zTotal) * 100) : 0;
    const tle31Progress =
      tle31Total > 0 ? Math.round((tle31Solved / tle31Total) * 100) : 0;

    return {
      a2z: {
        total: a2zTotal,
        solved: a2zSolved,
        progress: a2zProgress,
      },
      tle31: {
        total: tle31Total,
        solved: tle31Solved,
        progress: tle31Progress,
      },
    };
  }

  async manualCheck(
    userId: number,
    sheetProblemId: number,
    isSolved: boolean,
  ) {
    const problem = await this.sheetProblemRepo.findOne({
      where: { id: sheetProblemId },
    });
    if (!problem) {
      throw new NotFoundException('Sheet problem not found');
    }

    let progress = await this.userSheetProgressRepo.findOne({
      where: { userId, sheetProblemId },
    });

    if (!progress) {
      progress = this.userSheetProgressRepo.create({
        userId,
        sheetProblemId,
        sheetName: problem.sheetName,
        isSolved,
        solvedAt: isSolved ? new Date() : null,
        syncSource: 'manual',
      });
    } else {
      progress.isSolved = isSolved;
      progress.solvedAt = isSolved ? new Date() : null;
      progress.syncSource = 'manual';
    }

    await this.userSheetProgressRepo.save(progress);
    return { success: true, progress };
  }
}
