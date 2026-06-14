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

  @Column({ nullable: true, default: 0 })
cfCurrentRating!: number;

@Column({ nullable: true, default: 0 })
cfMaxRating!: number;

@Column({ nullable: true })
cfRank!: string;

@Column({ nullable: true, default: 0 })
ccCurrentRating!: number;

@Column({ nullable: true, default: 0 })
ccMaxRating!: number;

@Column({ nullable: true, default: 0 })
lcContestRating!: number;

@Column({ nullable: true, default: 0 })
totalSolved!: number;
  @UpdateDateColumn()
  updatedAt!: Date;
}