import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  platform!: string;

  @Column()
  problemId!: string;

  @Column()
  problemName!: string;

  @Column()
  verdict!: string;

  @Column({ nullable: true })
  language!: string;

  @Column()
  submittedAt!: Date;
}