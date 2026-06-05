import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RatingHistory } from './entities/rating-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(RatingHistory)
    private ratingRepo: Repository<RatingHistory>,
  ) {}

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
    return this.ratingRepo.save(ratings);
  }
}