import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class CompetitiveProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

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