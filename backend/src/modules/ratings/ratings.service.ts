import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RatingHistory } from './entities/rating-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RatingsService {
    constructor(
        @InjectRepository(RatingHistory)
        private ratingRepo: Repository<RatingHistory>,
    ) { }

    async getUserRatings(userId: number) {
        return this.ratingRepo.find({
            where: { userId },
            order: {
                contestTime: 'ASC',
            },
        });
    }

    async saveRatings(
        ratings: Partial<RatingHistory>[],
    ) {
        for (const rating of ratings) {

            const existing =
                await this.ratingRepo.findOne({
                    where: {
                        userId: rating.userId,
                        platform: rating.platform,
                        contestId: rating.contestId,
                    },
                });

            if (!existing) {
                await this.ratingRepo.save(rating);
            }
        }
    }
}