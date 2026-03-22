import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationRequest, RegistrationRequestStatus } from '../entities/registration-request.entity';

@Injectable()
export class RegistrationRequestRepository {
  constructor(
    @InjectRepository(RegistrationRequest)
    private repo: Repository<RegistrationRequest>,
  ) {}

  async findAll(): Promise<RegistrationRequest[]> {
    return this.repo.find({ relations: ['school'] });
  }

  async findById(id: string): Promise<RegistrationRequest | null> {
    return this.repo.findOne({ where: { id }, relations: ['school'] });
  }

  async findByWalletAddress(walletAddress: string): Promise<RegistrationRequest | null> {
    return this.repo.findOne({ where: { walletAddress }, relations: ['school'] });
  }

  async findByStatus(status: RegistrationRequestStatus): Promise<RegistrationRequest[]> {
    return this.repo.find({ where: { status }, relations: ['school'] });
  }

  async create(data: Partial<RegistrationRequest>): Promise<RegistrationRequest> {
    const request = this.repo.create(data);
    return this.repo.save(request);
  }

  async update(id: string, data: Partial<RegistrationRequest>): Promise<RegistrationRequest | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async updateStatus(id: string, status: RegistrationRequestStatus): Promise<RegistrationRequest | null> {
    await this.repo.update(id, { status });
    return this.findById(id);
  }

  async deleteByWalletAddress(walletAddress: string): Promise<boolean> {
    const result = await this.repo.delete({ walletAddress });
    return result.affected > 0;
  }
}
