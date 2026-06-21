import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Contest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  contestId!: number;

  @Column()
  rank!: number;

  @Column()
  oldRating!: number;

  @Column()
  newRating!: number;

  @Column()
  contestName!: string;
}