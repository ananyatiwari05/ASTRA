import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity()
export class CompetitiveProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @OneToOne(
    () => User,
    (user) => user.profile,
  )
  @JoinColumn()
  user!: User;

  @Column({ nullable: true })
  cfCurrentRating!: number;

  @Column({ nullable: true })
  cfMaxRating!: number;

  @Column({ nullable: true })
  cfRank!: string;

  @Column({ nullable: true })
  ccCurrentRating!: number;

  @Column({ nullable: true })
  ccMaxRating!: number;

  @Column({ nullable: true })
  lcContestRating!: number;

  @Column({ nullable: true })
  totalSolved!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}