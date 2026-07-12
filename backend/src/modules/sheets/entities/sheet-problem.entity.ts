import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
@Index(['sheetName', 'problemNumber'], { unique: true })
export class SheetProblem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sheetName!: string; // 'A2Z' | 'TLE31'

  @Column()
  problemNumber!: number;

  @Column()
  problemId!: string;

  @Column()
  title!: string;

  @Column()
  platform!: string;

  @Column({ nullable: true })
  difficulty!: string;

  @Column('simple-array', { nullable: true })
  tags!: string[];

  @Column({ nullable: true })
  topic!: string;

  @Column({ nullable: true })
  subTopic!: string;

  @Column({ nullable: true })
  ratingBucket!: string;

  @Column({ default: 0 })
  orderIndex!: number;

  @Column({ nullable: true })
  sourceUrl!: string;

  // Additional fields for complete A2Z representation
  @Column({ nullable: true })
  estimatedTime!: number;

  @Column('simple-array', { nullable: true })
  prerequisites!: string[];

  @Column({ default: false })
  isOptional!: boolean;
}
