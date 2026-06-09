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