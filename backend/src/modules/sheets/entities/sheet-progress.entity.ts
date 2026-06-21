import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum SheetProgressSource {
  A2Z = 'A2Z',
  TLE_ELIMINATOR = 'TLE Eliminator',
}

@Entity()
@Index(['userId', 'sheetName', 'problemId'], { unique: true })
export class SheetProgress {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  sheetName!: string;

  @Column()
  problemId!: string;

  @Column({ default: false })
  isSolved!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  solvedAt!: Date | null;

  @Column({ type: 'varchar' })
  source!: SheetProgressSource;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  syncedAt!: Date;
}
