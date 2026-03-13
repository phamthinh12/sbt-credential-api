import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Credential } from './entities/credential.entity';
import { MockDatabaseService } from '../common/services/mock-database.service';
import * as crypto from 'crypto';

@Injectable()
export class CredentialsService {
  constructor(private mockDb: MockDatabaseService) { }

  async findAll(): Promise<Credential[]> {
    return this.mockDb.findAllCredentials();
  }

  async findOne(id: string): Promise<Credential | undefined> {
    return this.mockDb.findCredentialById(id);
  }

  async findByStudentId(studentId: string): Promise<Credential[]> {
    return this.mockDb.findCredentialsByStudentId(studentId);
  }

  async findBySchoolId(schoolId: string): Promise<{ data: Credential[] }> {
    const all = this.mockDb.findAllCredentials();
    return { data: all.filter(c => c.schoolId === schoolId) };
  }

  async create(data: Partial<Credential>): Promise<Credential> {
    return this.mockDb.createCredential(data);
  }

  async update(id: string, data: Partial<Credential>): Promise<Credential | undefined> {
    return this.mockDb.updateCredential(id, data);
  }

  async revoke(id: string): Promise<any> {
    const credential = this.mockDb.findCredentialById(id);
    if (!credential) {
      throw new NotFoundException('Không tìm thấy văn bằng');
    }

    if (credential.status === 'revoked') {
      throw new BadRequestException('Văn bằng đã bị thu hồi trước đó');
    }

    this.mockDb.updateCredential(id, { status: 'revoked' as any });

    return { 
      success: true, 
      message: 'Đã thu hồi văn bằng', 
      status: 'revoked' 
    };
  }

  async confirm(id: string, data: { txHash?: string; tokenId?: string }): Promise<any> {
    const credential = this.mockDb.findCredentialById(id);
    if (!credential) {
      throw new NotFoundException('Không tìm thấy văn bằng');
    }

    if (credential.status !== 'issued') {
      throw new BadRequestException('Văn bằng phải ở trạng thái issued mới có thể xác nhận');
    }

    this.mockDb.updateCredential(id, { 
      status: 'confirmed' as any,
      txHash: data.txHash || null,
      tokenId: data.tokenId || null,
    });

    return { 
      success: true, 
      message: 'Đã xác nhận văn bằng', 
      status: 'confirmed' 
    };
  }

  async findByVerifyCode(code: string): Promise<Credential> {
    const credential = this.mockDb.findCredentialByVerifyCode(code);

    if (!credential) {
      throw new NotFoundException('Mã xác minh không tồn tại');
    }

    return credential;
  }

  async verifyFileIntegrity(code: string, fileBuffer: Buffer) {
    const credential = await this.findByVerifyCode(code);

    const uploadedFileHash = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

    const isValid = uploadedFileHash === credential.fileHash;

    return {
      isValid,
      message: isValid ? 'Văn bằng hợp lệ' : 'Cảnh báo: Nội dung file đã bị thay đổi!',
      metadata: {
        studentName: credential.student?.name,
        credentialName: credential.name,
        issuedAt: credential.issuedAt
      }
    };
  }
}