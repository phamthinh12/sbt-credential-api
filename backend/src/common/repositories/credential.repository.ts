import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential, CredentialStatus } from '../entities/credential.entity';

@Injectable()
export class CredentialRepository {
  constructor(
    @InjectRepository(Credential)
    private repo: Repository<Credential>,
  ) {}

  async findAll(): Promise<Credential[]> {
    return this.repo.find({ relations: ['student', 'school'] });
  }

  async findById(id: string): Promise<Credential | null> {
    return this.repo.findOne({ where: { id }, relations: ['student', 'school'] });
  }

  async findByVerifyCode(code: string): Promise<Credential | null> {
    return this.repo.findOne({ where: { verifyCode: code }, relations: ['student', 'school'] });
  }

  async findByStudentId(studentId: string): Promise<Credential[]> {
    return this.repo.find({ where: { studentId }, relations: ['student', 'school'] });
  }

  async findBySchoolId(schoolId: string): Promise<Credential[]> {
    return this.repo.find({ where: { schoolId }, relations: ['student', 'school'] });
  }

  async create(data: Partial<Credential>): Promise<Credential> {
    const credential = this.repo.create(data);
    return this.repo.save(credential);
  }

  async update(id: string, data: Partial<Credential>): Promise<Credential | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async findPendingCredentials(): Promise<Credential[]> {
    return this.repo.find({ where: { status: CredentialStatus.PENDING } });
  }

  async generateVerifyCode(): Promise<string> {
    return `CRED-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
}
