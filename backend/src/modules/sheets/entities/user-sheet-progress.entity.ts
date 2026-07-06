import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SheetProblem } from './sheet-problem.entity';

@Entity()
@Index(['userId', 'sheetProblemId'], { unique: true })
export class UserSheetProgress {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  sheetProblemId!: number;

  @Column()
  sheetName!: string; // 'A2Z' | 'TLE31'

  @Column({ default: false })
  isSolved!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  solvedAt!: Date | null;

  @Column({ type: 'varchar', default: 'manual' })
  syncSource!: 'api' | 'manual';

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => SheetProblem, { onDelete: 'CASCADE' })
  sheetProblem!: SheetProblem;
}
