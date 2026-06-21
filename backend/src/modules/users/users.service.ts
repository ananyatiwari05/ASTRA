import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(userData: Partial<User>) {
    const user = this.userRepo.create(userData);
    return this.userRepo.save(user);
  }

  async findOne(id: number) {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
    });
  }

  async findById(id: number) {
    return this.userRepo.findOne({
      where: { id },
    });
  }

  async updateHandles(
    id: number,
    cfHandle: string,
    ccHandle: string,
    lcHandle: string,
  ) {
    await this.userRepo.update(id, {
      cfHandle,
      ccHandle,
      lcHandle,
    });

    return this.findById(id);
  }

  async updateSheetHandles(
    id: number,
    a2zEmail?: string,
    dailyEliminatorEmail?: string,
  ) {
    const update: Partial<User> = {};

    if (a2zEmail !== undefined) {
      update.a2zEmail = a2zEmail || undefined;
    }

    if (dailyEliminatorEmail !== undefined) {
      update.TLEliminatorEmail = dailyEliminatorEmail || undefined;
    }

    await this.userRepo.update(id, update);

    return this.findById(id);
  }

  async updateCfLastSynced(id: number) {
    await this.userRepo.update(id, {
      cfLastSyncedAt: new Date(),
    });
  }

  async updateA2zLastSynced(id: number) {
    await this.userRepo.update(id, {
      a2zLastSyncedAt: new Date(),
    });
  }

  async updateTleLastSynced(id: number) {
    await this.userRepo.update(id, {
      tleLastSyncedAt: new Date(),
    });
  }
}