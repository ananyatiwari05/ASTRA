import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Problem } from '../problems/entities/problem.entity';

@Injectable()
export class SheetsService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemRepo: Repository<Problem>,
  ) {}

  async getAllSheets() {
    const problems = await this.problemRepo.find();
    const sheetMap = new Map<
      string,
      { name: string; totalProblems: number }
    >();

    for (const problem of problems) {
      for (const sheetName of problem.sheet ?? []) {
        if (!sheetMap.has(sheetName)) {
          sheetMap.set(sheetName, {
            name: sheetName,
            totalProblems: 0,
          });
        }

        sheetMap.get(sheetName)!.totalProblems++;
      }
    }

    return Array.from(sheetMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  async getSheetByName(sheetName: string) {
    const problems = await this.getSheetProblems(sheetName);

    return {
      name: sheetName,
      totalProblems: problems.length,
      topics: [
        ...new Set(
          problems.flatMap((p) => p.tags ?? []),
        ),
      ].sort(),
    };
  }

  async getSheetProblems(sheetName: string) {
    return this.problemRepo
      .createQueryBuilder('problem')
      .where('problem.sheet ILIKE :sheet', {
        sheet: `%${sheetName}%`,
      })
      .orderBy('problem.title', 'ASC')
      .getMany();
  }
}
