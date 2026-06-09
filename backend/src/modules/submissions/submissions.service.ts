import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubmissionsService {
    constructor(
        @InjectRepository(Submission)
        private submissionRepo: Repository<Submission>,
    ) { }

    async getUserSubmissions(
        userId: number,
    ) {
        return this.submissionRepo.find({
            where: { userId },
            order: {
                submittedAt: 'DESC',
            },
        });
    }

    async saveSubmissions(
        submissions: Partial<Submission>[],
    ) {
        for (const submission of submissions) {

            const existing =
                await this.submissionRepo.findOne({
                    where: {
                        userId: submission.userId,
                        platform: submission.platform,
                        problemId: submission.problemId,
                        submittedAt: submission.submittedAt,
                    },
                });

            if (!existing) {
                await this.submissionRepo.save(
                    submission,
                );
            }
        }
    }
}