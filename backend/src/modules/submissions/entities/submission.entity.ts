import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

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
    @ManyToOne(
        () => User,
        (user) => user.submissions,
    )
    user!: User;
}