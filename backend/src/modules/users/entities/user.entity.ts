import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}