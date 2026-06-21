import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity()
@Index(['sheetName', 'sheetProblemId'], { unique: true })
export class ProblemMap {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sheetProblemId!: string;

  @Column()
  platform!: string;

  @Column()
  platformProblemId!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  difficulty!: number;

  @Column('simple-array')
  tags!: string[];

  @Column()
  sheetName!: string;
}
