import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { School } from './school.entity';

export enum CredentialStatus {
  PENDING = 'pending',
  ISSUED = 'issued',
  CONFIRMED = 'confirmed',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  schoolId: string;

  @ManyToOne(() => School, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  ipfsHash: string;

  @Column({ nullable: true })
  ipfsUrl: string;

  @Column({ nullable: true })
  fileHash: string;

  @Column({
    type: 'enum',
    enum: CredentialStatus,
    default: CredentialStatus.PENDING,
  })
  status: CredentialStatus;

  @Column({ nullable: true })
  txHash: string;

  @Column({ nullable: true })
  tokenId: string;

  @Column({ nullable: true })
  verifyCode: string;

  @Column({ nullable: true })
  issuedAt: Date;

  @Column({ nullable: true })
  classification: string;

  @Column({ nullable: true })
  major: string;

  @Column({ nullable: true })
  issuerName: string;

  @Column({ nullable: true })
  expiryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
