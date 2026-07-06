import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Submission } from '../submissions/entities/submission.entity';
import { Problem } from '../problems/entities/problem.entity';
import { Contest } from '../contests/entities/contest.entity';
import { SheetProblem } from '../sheets/entities/sheet-problem.entity';
import { UserSheetProgress } from '../sheets/entities/user-sheet-progress.entity';
import {
  attachProblemsToSubmissions,
  buildProblemLookup,
  getSubmissionTags,
  isAcceptedVerdict,
} from '../../common/utils/submission-problem.util';
import { normalizeTag } from '../../common/utils/tag.util';

export type UnifiedSolvedProblem = {
  problemId: string;
  platform: string;
  title: string;
  tags: string[];
  difficulty: number;
  source: string;
  solvedAt: Date | null;
  url: string;
};

export type UnifiedAttemptRecord = {
  problemId: string;
  platform: string;
  title: string;
  tags: string[];
  difficulty: number;
  verdict: string;
  submittedAt: Date;
  source: string;
};

@Injectable()
export class UnifiedSolveService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,

    @InjectRepository(Problem)
    private readonly problemRepo: Repository<Problem>,

    @InjectRepository(UserSheetProgress)
    private readonly userSheetProgressRepo: Repository<UserSheetProgress>,

    @InjectRepository(SheetProblem)
    private readonly sheetProblemRepo: Repository<SheetProblem>,

    @InjectRepository(Contest)
    private readonly contestRepo: Repository<Contest>,
  ) { }

  async getUnifiedSolvedProblems(
    userId: number,
  ): Promise<UnifiedSolvedProblem[]> {
    const [cfSolved, sheetSolved, contestSolved] = await Promise.all([
      this.getCodeforcesSolved(userId),
      this.getSheetSolved(userId),
      this.getContestSolved(userId),
    ]);

    const merged = new Map<string, UnifiedSolvedProblem>();

    for (const problem of [...cfSolved, ...sheetSolved, ...contestSolved]) {
      const key = `${problem.platform}:${problem.problemId}`;
      const existing = merged.get(key);

      if (
        !existing ||
        (problem.solvedAt &&
          (!existing.solvedAt || problem.solvedAt > existing.solvedAt))
      ) {
        merged.set(key, problem);
      }
    }

    return [...merged.values()].sort((a, b) =>
      (a.title ?? '').localeCompare(b.title ?? ''),
    );
  }

  async getUnifiedAttempts(
    userId: number,
  ): Promise<UnifiedAttemptRecord[]> {
    const submissions = await this.submissionRepo.find({
      where: { userId },
      order: { submittedAt: 'DESC' },
    });

    const problemIds = [...new Set(submissions.map((s) => s.problemId))];
    const platforms = [...new Set(submissions.map((s) => s.platform))];

    const problems = problemIds.length
      ? await this.problemRepo
        .createQueryBuilder('problem')
        .where('problem.problemId IN (:...problemIds)', { problemIds })
        .andWhere('problem.platform IN (:...platforms)', { platforms })
        .getMany()
      : [];

    const enriched = attachProblemsToSubmissions(
      submissions,
      buildProblemLookup(problems),
    );

    return enriched.map((submission) => ({
      problemId: submission.problemId,
      platform: submission.platform,
      title:
        submission.problemTitle ?? submission.problemName ?? submission.problemId,
      tags: getSubmissionTags(submission),
      difficulty:
        submission.problemDifficulty ?? submission.rating ?? 0,
      verdict: submission.verdict,
      submittedAt: submission.submittedAt,
      source: 'codeforces',
    }));
  }

  async getTopicBreakdown(userId: number) {
    const attempts = await this.getUnifiedAttempts(userId);
    const solved = await this.getUnifiedSolvedProblems(userId);
    const solvedKeys = new Set(
      solved.map((p) => `${p.platform}:${p.problemId}`),
    );

    const topicStats: Record<
      string,
      { solved: number; attempted: number; failed: number }
    > = {};

    const processedCFProblems = new Set<string>();

    for (const attempt of attempts) {
      const key = `${attempt.platform}:${attempt.problemId}`;
      processedCFProblems.add(key);

      for (const tag of attempt.tags) {
        const topic = normalizeTag(tag);
        if (!topic) continue;

        if (!topicStats[topic]) {
          topicStats[topic] = { solved: 0, attempted: 0, failed: 0 };
        }

        topicStats[topic].attempted++;

        if (isAcceptedVerdict(attempt.verdict)) {
          topicStats[topic].solved++;
        } else {
          topicStats[topic].failed++;
        }
      }
    }

    for (const problem of solved) {
      const key = `${problem.platform}:${problem.problemId}`;
      if (processedCFProblems.has(key)) continue;

      for (const tag of problem.tags) {
        const topic = normalizeTag(tag);
        if (!topic) continue;

        if (!topicStats[topic]) {
          topicStats[topic] = { solved: 0, attempted: 0, failed: 0 };
        }

        topicStats[topic].solved++;
        topicStats[topic].attempted++;
      }
    }

    return Object.entries(topicStats)
      .map(([topic, stats]) => {
        const successRate =
          stats.attempted > 0
            ? (stats.solved / stats.attempted) * 100
            : stats.solved > 0
              ? 100
              : 0;

        return {
          topic,
          solved: stats.solved,
          attempted: stats.attempted,
          failed: stats.failed,
          successRate: Math.round(successRate * 100) / 100,
        };
      })
      .sort((a, b) => b.attempted - a.attempted);
  }

  async getDifficultyDistribution(userId: number) {
    const solved = await this.getUnifiedSolvedProblems(userId);

    const distribution = {
      easy: 0,
      medium: 0,
      hard: 0,
      unknown: 0,
    };

    for (const problem of solved) {
      const difficulty = problem.difficulty ?? 0;

      if (difficulty <= 1) {
        distribution.easy++;
      } else if (difficulty === 2) {
        distribution.medium++;
      } else if (difficulty >= 3) {
        distribution.hard++;
      } else {
        distribution.unknown++;
      }
    }

    return distribution;
  }

  async getContestWeaknesses(userId: number) {
    const submissions = await this.submissionRepo.find({
      where: { userId, platform: 'codeforces' },
    });

    const contests = await this.contestRepo.find({
      where: { userId },
    });

    const contestIds = new Set(contests.map((c) => c.contestId));
    const topicFailures: Record<string, number> = {};

    for (const submission of submissions) {
      const contestMatch = submission.problemId.match(/^(\d+)-/);

      if (!contestMatch) continue;

      const contestId = Number(contestMatch[1]);

      if (!contestIds.has(contestId)) continue;
      if (isAcceptedVerdict(submission.verdict)) continue;

      for (const tag of submission.tags ?? []) {
        const topic = normalizeTag(tag);
        if (!topic) continue;
        topicFailures[topic] = (topicFailures[topic] ?? 0) + 1;
      }
    }

    return Object.entries(topicFailures)
      .map(([topic, failures]) => ({ topic, failures }))
      .sort((a, b) => b.failures - a.failures);
  }

  private async getCodeforcesSolved(
    userId: number,
  ): Promise<UnifiedSolvedProblem[]> {
    const submissions = await this.submissionRepo.find({
      where: { userId },
      order: { submittedAt: 'ASC' },
    });

    const accepted = submissions.filter((s) =>
      isAcceptedVerdict(s.verdict),
    );

    const problemIds = [...new Set(accepted.map((s) => s.problemId))];
    const platforms = [...new Set(accepted.map((s) => s.platform))];

    const problems = problemIds.length
      ? await this.problemRepo
        .createQueryBuilder('problem')
        .where('problem.problemId IN (:...problemIds)', { problemIds })
        .andWhere('problem.platform IN (:...platforms)', { platforms })
        .getMany()
      : [];

    const problemMap = buildProblemLookup(problems);
    const firstSolve = new Map<string, Date>();

    for (const submission of accepted) {
      const key = `${submission.platform}:${submission.problemId}`;

      if (!firstSolve.has(key)) {
        firstSolve.set(key, submission.submittedAt);
      }
    }

    const result: UnifiedSolvedProblem[] = [];

    for (const [key, solvedAt] of firstSolve.entries()) {
      const problem = problemMap.get(key);
      const [platform, problemId] = key.split(':');

      result.push({
        problemId,
        platform,
        title: problem?.title ?? problemId,
        tags: problem?.tags ?? [],
        difficulty: problem?.difficulty ?? 0,
        source: 'codeforces',
        solvedAt,
        url: problem?.url ?? '',
      });
    }

    return result;
  }

  private async getSheetSolved(
    userId: number,
  ): Promise<UnifiedSolvedProblem[]> {
    const progress = await this.userSheetProgressRepo.find({
      where: { userId, isSolved: true },
      relations: {
        sheetProblem: true,
      },
    });

    return progress
      .map((p) => {
        const sp = p.sheetProblem;
        if (!sp) return null;

        let diffNum = 0;
        if (typeof sp.difficulty === 'string') {
          const d = sp.difficulty.toLowerCase();
          if (d === 'easy') diffNum = 1;
          else if (d === 'medium') diffNum = 2;
          else if (d === 'hard') diffNum = 3;
        } else {
          diffNum = Number(sp.difficulty ?? 0);
        }

        return {
          problemId: sp.problemId,
          platform: sp.platform,
          title: sp.title,
          tags: sp.tags ?? [],
          difficulty: diffNum,
          source: p.sheetName,
          solvedAt: p.solvedAt,
          url: sp.sourceUrl ?? '',
        };
      })
      .filter((x): x is UnifiedSolvedProblem => x !== null);
  }

  private async getContestSolved(
    userId: number,
  ): Promise<UnifiedSolvedProblem[]> {
    const submissions = await this.submissionRepo.find({
      where: { userId, platform: 'codeforces' },
      order: { submittedAt: 'ASC' },
    });

    const contests = await this.contestRepo.find({ where: { userId } });
    const contestIds = new Set(contests.map((c) => c.contestId));
    const result: UnifiedSolvedProblem[] = [];
    const seen = new Set<string>();

    for (const submission of submissions) {
      if (!isAcceptedVerdict(submission.verdict)) continue;

      const contestMatch = submission.problemId.match(/^(\d+)-/);

      if (!contestMatch) continue;

      const contestId = Number(contestMatch[1]);

      if (!contestIds.has(contestId)) continue;

      const key = `${submission.platform}:${submission.problemId}`;

      if (seen.has(key)) continue;

      seen.add(key);

      result.push({
        problemId: submission.problemId,
        platform: submission.platform,
        title: submission.problemName,
        tags: submission.tags ?? [],
        difficulty: submission.rating ?? 0,
        source: 'contest',
        solvedAt: submission.submittedAt,
        url: `https://codeforces.com/problemset/problem/${submission.problemId.replace('-', '/')}`,
      });
    }

    return result;
  }
}
