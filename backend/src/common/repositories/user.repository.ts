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
    return this.repo.find();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repo.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
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

  async seedDefaultSchoolAdmin(schoolId: string): Promise<void> {
    const existing = await this.findByUsername('school_admin');
    if (!existing) {
      const passwordHash = await bcrypt.hash('school123', 10);
      await this.create({
        username: 'school_admin',
        passwordHash,
        role: UserRole.SCHOOL_ADMIN,
        schoolId,
      });
    }
  }
}
