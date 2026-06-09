import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompetitiveProfile } from './entities/competitive-profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProfilesService {
    constructor(
        @InjectRepository(CompetitiveProfile)
        private profileRepo: Repository<CompetitiveProfile>,
    ) { }

    async findByUserId(userId: number) {
        return this.profileRepo.findOne({
            where: { userId },
        });
    }

    async saveProfile(
        data: Partial<CompetitiveProfile>,
    ) {
        const existing =
            await this.profileRepo.findOne({
                where: {
                    userId: data.userId,
                },
            });

        if (existing) {
            Object.assign(existing, data);

            return this.profileRepo.save(existing);
        }

        return this.profileRepo.save(data);
    }
}