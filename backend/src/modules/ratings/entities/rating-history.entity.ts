import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity()
export class RatingHistory {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number;

    @Column()
    platform!: string;

    @Column()
    contestId!: string;

    @Column()
    contestName!: string;

    @Column()
    ratingBefore!: number;

    @Column()
    ratingAfter!: number;

    @Column()
    ratingChange!: number;

    @Column()
    rank!: number;

    @Column()
    contestTime!: Date;

    @ManyToOne(
        () => User,
        (user) => user.ratings,
    )
    user!: User;
}