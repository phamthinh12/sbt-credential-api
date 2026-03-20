import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../entities/school.entity';

@Injectable()
export class SchoolRepository {
  constructor(
    @InjectRepository(School)
    private repo: Repository<School>,
  ) {}

  async findAll(): Promise<School[]> {
    return this.repo.find({ relations: ['students', 'credentials', 'users'] });
  }

  async findById(id: string): Promise<School | null> {
    return this.repo.findOne({ where: { id }, relations: ['students', 'credentials', 'users'] });
  }

  async findByWalletAddress(walletAddress: string): Promise<School | null> {
    return this.repo.findOne({ where: { walletAddress }, relations: ['students', 'credentials', 'users'] });
  }

  async create(data: Partial<School>): Promise<School> {
    const school = this.repo.create(data);
    return this.repo.save(school);
  }

  async update(id: string, data: Partial<School>): Promise<School | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected > 0;
  }

  async seedDefaultSchool(): Promise<void> {
    const existing = await this.findByWalletAddress('0xA30EEbA7AD3712fDf080b0C2aadB5906B05347E7');
    if (!existing) {
      await this.create({
        name: 'Đại học Bách Khoa',
        walletAddress: '0xA30EEbA7AD3712fDf080b0C2aadB5906B05347E7',
        isActive: true,
      });
    }
  }
}
