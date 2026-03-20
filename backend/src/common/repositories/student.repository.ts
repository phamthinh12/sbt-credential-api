import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from '../entities/student.entity';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private repo: Repository<Student>,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<Student | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findByWalletAddress(walletAddress: string): Promise<Student | null> {
    return this.repo.findOne({ where: { walletAddress } });
  }

  async findBySchoolId(schoolId: string): Promise<Student[]> {
    return this.repo.find({ where: { schoolId } });
  }

  async create(data: Partial<Student>): Promise<Student> {
    const student = this.repo.create(data);
    return this.repo.save(student);
  }

  async update(id: string, data: Partial<Student>): Promise<Student | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected > 0;
  }

  async seedDefaultStudent(): Promise<void> {
    const existing = await this.findByWalletAddress('0xcd3B766CCDd6AE721141F452C550Ca635964ce71');
    if (!existing) {
      const school = await this.findById('school-001') || { id: 'school-001' };
      await this.create({
        name: 'Nguyễn Văn A',
        email: 'a.nguyenvan@example.com',
        walletAddress: '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
        studentCode: 'SV001',
        status: StudentStatus.ACTIVE,
        schoolId: school.id,
      });
    }
  }
}
