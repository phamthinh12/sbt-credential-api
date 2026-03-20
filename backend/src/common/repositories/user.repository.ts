import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.repo.find({ relations: ['school'] });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username }, relations: ['school'] });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: ['school'] });
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.repo.findOne({ where: { schoolId: walletAddress } });
  }

  async findAdmins(): Promise<User[]> {
    return this.repo.find({
      where: [
        { role: UserRole.SUPER_ADMIN },
        { role: UserRole.SCHOOL_ADMIN },
      ],
      relations: ['school'],
    });
  }

  async seedDefaultAdmin(): Promise<void> {
    const existing = await this.findByUsername('admin');
    if (!existing) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await this.create({
        username: 'admin',
        passwordHash,
        role: UserRole.SUPER_ADMIN,
      });
    }
  }
}
