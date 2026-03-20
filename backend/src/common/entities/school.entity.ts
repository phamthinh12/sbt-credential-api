import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Student } from './student.entity';
import { Credential } from './credential.entity';
import { User } from './user.entity';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  walletAddress: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Student, (student) => student.school)
  students: Student[];

  @OneToMany(() => Credential, (credential) => credential.school)
  credentials: Credential[];

  @OneToMany(() => User, (user) => user.school)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
