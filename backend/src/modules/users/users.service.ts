import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  create(userData: Partial<User>) {
    const user = this.userRepo.create(userData);
    return this.userRepo.save(user);
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
    });
  }

  findById(id: number) {
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
  console.log('Updating user:', id);

  await this.userRepo.update(id, {
    cfHandle,
    ccHandle,
    lcHandle,
  });

  return this.findById(id);
}
}