import { Injectable } from '@nestjs/common';
import { Credential } from './entities/credential.entity';
import { MockDatabaseService } from '../common/services/mock-database.service';
import * as crypto from 'crypto';
import { NotFoundException } from '@nestjs/common';

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

  async create(data: Partial<Credential>): Promise<Credential> {
    return this.mockDb.createCredential(data);
  }

  async update(id: string, data: Partial<Credential>): Promise<Credential | undefined> {
    return this.mockDb.updateCredential(id, data);
  }

  async findByVerifyCode(code: string): Promise<Credential> {
    const credential = this.mockDb.findCredentialByVerifyCode(code);

    // Nếu không tìm thấy, báo lỗi 404 ngay lập tức cho API
    if (!credential) {
      throw new NotFoundException('Mã xác minh không tồn tại');
    }

    return credential;
  }

  // Logic chính: So sánh File Hash sử dụng hàm findByVerifyCode ở trên
  async verifyFileIntegrity(code: string, fileBuffer: Buffer) {
    // Gọi hàm đã gộp ở trên, nếu lỗi nó sẽ dừng tại đây và báo về Client
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
        studentName: credential.student.name,
        credentialName: credential.name,
        issuedAt: credential.issuedAt
      }
    };
  }
}