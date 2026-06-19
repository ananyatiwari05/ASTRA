import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Problem } from '../../problems/entities/problem.entity';

@Entity()
export class UserProgress {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Problem)
  problem!: Problem;

  @Column({ default: false })
  solved!: boolean;

  @Column({ nullable: true })
  confidence!: number;

  @Column({ nullable: true })
  solvedAt!: Date;
}