import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Problem } from './entities/problem.entity';

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemRepo: Repository<Problem>,
  ) {}

  async filterProblems(filters: {
    tag?: string;
    difficulty?: string;
    platform?: string;
    sheet?: string;
  }) {
    const qb = this.problemRepo.createQueryBuilder('problem');

    if (filters.platform) {
      qb.andWhere('problem.platform = :platform', {
        platform: filters.platform.toLowerCase(),
      });
    }

    if (filters.difficulty) {
      const difficultyMap: Record<string, number> = {
        easy: 1,
        medium: 2,
        hard: 3,
      };

      const difficultyValue =
        difficultyMap[filters.difficulty.toLowerCase()] ??
        parseInt(filters.difficulty, 10);

      if (!Number.isNaN(difficultyValue)) {
        qb.andWhere('problem.difficulty = :difficulty', {
          difficulty: difficultyValue,
        });
      }
    }

    if (filters.tag) {
      const normalizedTag = filters.tag
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_');

      qb.andWhere('problem.tags ILIKE :tag', {
        tag: `%${normalizedTag}%`,
      });
    }

    if (filters.sheet) {
      qb.andWhere('problem.sheet ILIKE :sheet', {
        sheet: `%${filters.sheet}%`,
      });
    }

    return qb.orderBy('problem.title', 'ASC').getMany();
  }

  async findByPlatformAndIds(
    platform: string,
    problemIds: string[],
  ) {
    if (!problemIds.length) {
      return [];
    }

    return this.problemRepo.find({
      where: {
        platform,
        problemId: In(problemIds),
      },
    });
  }

  async findAll() {
    return this.problemRepo.find({
      order: { title: 'ASC' },
    });
  }
}
