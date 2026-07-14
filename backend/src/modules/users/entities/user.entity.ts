import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';

import { CompetitiveProfile } from '../../profiles/entities/competitive-profile.entity';
import { RatingHistory } from '../../ratings/entities/rating-history.entity';
import { Submission } from '../../submissions/entities/submission.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  password!: string;

  @Column({ default: 'local' })
  provider!: string;

  @Column({ nullable: true })
  googleId!: string;

  @Column({ nullable: true })
  githubId!: string;

  @Column({ nullable: true })
  cfHandle!: string;
  
  @Column({ nullable: true })
  ccHandle!: string;

  @Column({ nullable: true })
  lcHandle!: string;

  @Column({ nullable: true })
  a2zEmail!: string;

  @Column({ nullable: true })
  TLEliminatorEmail!: string;

  @Column({ default: 'manual' })
  trackingPreference!: string;

  @Column({ type: 'timestamp', nullable: true })
  cfLastSyncedAt!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lcLastSyncedAt!: Date | null;

  @OneToOne(
    () => CompetitiveProfile,
    (profile) => profile.user,
  )
  profile!: CompetitiveProfile;

  @OneToMany(
    () => RatingHistory,
    (rating) => rating.user,
  )
  ratings!: RatingHistory[];

  @OneToMany(
    () => Submission,
    (submission) => submission.user,
  )
  submissions!: Submission[];
}