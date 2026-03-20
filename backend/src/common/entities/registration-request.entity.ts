import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { School } from './school.entity';

export enum RegistrationRequestType {
  SCHOOL = 'school',
  STUDENT = 'student',
}

export enum RegistrationRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('registration_requests')
export class RegistrationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  walletAddress: string;

  @Column({
    type: 'enum',
    enum: RegistrationRequestType,
  })
  type: RegistrationRequestType;

  @Column({
    type: 'enum',
    enum: RegistrationRequestStatus,
    default: RegistrationRequestStatus.PENDING,
  })
  status: RegistrationRequestStatus;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  schoolName: string;

  @Column({ nullable: true })
  schoolDocument: string;

  @Column({ nullable: true })
  studentCode: string;

  @Column({ nullable: true })
  schoolId: string;

  @ManyToOne(() => School, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
