import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';

import { Problem } from '../problems/entities/problem.entity';
import { Submission } from '../submissions/entities/submission.entity';

@Injectable()
export class UpsolveService {
  constructor(
    @InjectRepository(Problem)
    private problemRepo: Repository<Problem>,

    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,
  ) {}

  async generateUpsolveQueue(userId: number) {
    const solved = await this.submissionRepo.find({
      where: {
        userId,
        verdict: 'OK',
      },
    });

    const solvedIds = solved.map((s) => s.problemId);

    const unsolvedProblems =
      await this.problemRepo.find({
        where: {
          problemId: Not(In(solvedIds)),
        },
        take: 20,
      });

    return unsolvedProblems;
  }
}