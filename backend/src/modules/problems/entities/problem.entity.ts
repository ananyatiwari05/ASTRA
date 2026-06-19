import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Problem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  platform!: string;

  @Column()
  problemId!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  difficulty!: number;

  @Column('simple-array')
  tags!: string[];

  @Column()
  sheet!: string;

  @Column({ default: '' })
  url!: string;

  @CreateDateColumn()
  createdAt!: Date;
}