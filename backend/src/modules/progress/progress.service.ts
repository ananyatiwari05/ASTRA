import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Problem } from '../problems/entities/problem.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { UserSheetProgress } from '../sheets/entities/user-sheet-progress.entity';
import { ProblemMap } from '../sheets/entities/problem-map.entity';
import { isAcceptedVerdict } from '../../common/utils/submission-problem.util';

type SubmissionLookup = Map<
  string,
  { verdict: string; lastSolvedAt: Date | null }
>;

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Problem)
    private problemRepo: Repository<Problem>,

    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,

    @InjectRepository(UserSheetProgress)
    private userSheetProgressRepo: Repository<UserSheetProgress>,

    @InjectRepository(ProblemMap)
    private problemMapRepo: Repository<ProblemMap>,
  ) {}

  private buildSubmissionLookup(
    submissions: Submission[],
  ): SubmissionLookup {
    const lookup: SubmissionLookup = new Map();

    for (const submission of submissions) {
      const key = `${submission.platform}:${submission.problemId}`;
      const existing = lookup.get(key);
      const accepted = isAcceptedVerdict(submission.verdict);

      if (!existing) {
        lookup.set(key, {
          verdict: submission.verdict,
          lastSolvedAt: accepted ? submission.submittedAt : null,
        });
        continue;
      }

      if (
        accepted &&
        (!existing.lastSolvedAt ||
          submission.submittedAt > existing.lastSolvedAt)
      ) {
        existing.verdict = submission.verdict;
        existing.lastSolvedAt = submission.submittedAt;
      }
    }

    return lookup;
  }

  private async buildSheetProgressLookup(userId: number) {
    const [userProgress, maps] = await Promise.all([
      this.userSheetProgressRepo.find({
        where: { userId, isSolved: true },
        relations: { sheetProblem: true },
      }),
      this.problemMapRepo.find(),
    ]);

    const mapLookup = new Map(
      maps.map((entry) => [
        `${entry.sheetName}:${entry.sheetProblemId}`,
        entry,
      ]),
    );

    const lookup = new Map<
      string,
      { source: string; lastSolvedAt: Date | null }
    >();

    for (const entry of userProgress) {
      if (!entry.sheetProblem) continue;
      const key = `${entry.sheetProblem.platform}:${entry.sheetProblem.problemId}`;
      lookup.set(key, {
        source: entry.sheetName,
        lastSolvedAt: entry.solvedAt,
      });
    }

    return lookup;
  }

  async getSheetProgress(userId: number) {
    const submissions = await this.submissionRepo.find({
      where: { userId },
    });

    const submissionLookup = this.buildSubmissionLookup(submissions);
    const sheetLookup = await this.buildSheetProgressLookup(userId);

    const allProblems = await this.problemRepo.find();
    const grouped: Record<string, { total: number; solved: number }> = {};

    for (const problem of allProblems) {
      const key = `${problem.platform}:${problem.problemId}`;
      const isSolved =
        Boolean(submissionLookup.get(key)?.lastSolvedAt) ||
        sheetLookup.has(key);

      for (const sheetName of problem.sheet ?? []) {
        if (!grouped[sheetName]) {
          grouped[sheetName] = { total: 0, solved: 0 };
        }

        grouped[sheetName].total++;

        if (isSolved) {
          grouped[sheetName].solved++;
        }
      }
    }

    return grouped;
  }

  async getAllSheetsProgress(userId: number) {
    const submissions = await this.submissionRepo.find({
      where: { userId },
    });

    const submissionLookup = this.buildSubmissionLookup(submissions);
    const sheetLookup = await this.buildSheetProgressLookup(userId);

    const allProblems = await this.problemRepo.find();
    const sheets: Record<
      string,
      {
        sheetName: string;
        totalProblems: number;
        solvedProblems: number;
        remaining: number;
        progressPercentage: number;
        problems: {
          problemId: string;
          title: string;
          platform: string;
          difficulty: number;
          tags: string[];
          url: string;
          solved: boolean;
          verdict: string | null;
          lastSolvedAt: Date | null;
          source: string | null;
        }[];
      }
    > = {};

    for (const problem of allProblems) {
      const key = `${problem.platform}:${problem.problemId}`;
      const submission = submissionLookup.get(key);
      const sheetEntry = sheetLookup.get(key);
      const solved = Boolean(submission?.lastSolvedAt) || Boolean(sheetEntry);
      const source = sheetEntry?.source ?? (submission?.lastSolvedAt ? 'codeforces' : null);

      for (const sheetName of problem.sheet ?? []) {
        if (!sheets[sheetName]) {
          sheets[sheetName] = {
            sheetName,
            totalProblems: 0,
            solvedProblems: 0,
            remaining: 0,
            progressPercentage: 0,
            problems: [],
          };
        }

        sheets[sheetName].totalProblems++;

        if (solved) {
          sheets[sheetName].solvedProblems++;
        }

        sheets[sheetName].problems.push({
          problemId: problem.problemId,
          title: problem.title,
          platform: problem.platform,
          difficulty: problem.difficulty,
          tags: problem.tags ?? [],
          url: problem.url,
          solved,
          verdict: submission?.verdict ?? (solved ? 'SHEET' : null),
          lastSolvedAt:
            sheetEntry?.lastSolvedAt ?? submission?.lastSolvedAt ?? null,
          source,
        });
      }
    }

    return Object.values(sheets)
      .map((sheet) => ({
        ...sheet,
        remaining: sheet.totalProblems - sheet.solvedProblems,
        progressPercentage:
          sheet.totalProblems > 0
            ? Math.round(
                (sheet.solvedProblems / sheet.totalProblems) * 100,
              )
            : 0,
        problems: sheet.problems.sort((a, b) =>
          a.title.localeCompare(b.title),
        ),
      }))
      .sort((a, b) => a.sheetName.localeCompare(b.sheetName));
  }
}
