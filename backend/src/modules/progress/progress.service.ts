import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Problem } from '.././problems/entities/problem.entity';
import { Submission } from '../submissions/entities/submission.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Problem)
    private problemRepo: Repository<Problem>,

    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,
  ) {}

  async getSheetProgress(userId: number) {
    const solvedSubs = await this.submissionRepo.find({
      where: {
        user: { id: userId },
        verdict: 'OK',
      },
    });

    const solvedProblemIds = solvedSubs.map((s) => s.problemId);

    const allProblems = await this.problemRepo.find();

    const grouped = {};

    for (const problem of allProblems) {
      if (!grouped[problem.sheet]) {
        grouped[problem.sheet] = {
          total: 0,
          solved: 0,
        };
      }

      grouped[problem.sheet].total++;

      if (solvedProblemIds.includes(problem.problemId)) {
        grouped[problem.sheet].solved++;
      }
    }

    return grouped;
  }
}