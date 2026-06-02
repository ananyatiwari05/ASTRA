import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  cfHandle!: string;

  @Column({ nullable: true })
  ccHandle!: string;

  @Column({ nullable: true })
  lcHandle!: string;
  
}