import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { MockDatabaseService } from '../common/services/mock-database.service';
import * as crypto from 'crypto';

interface User {
  userId: string;
  sub?: string;
  username: string;
  role: string;
  schoolId?: string;
}

@Injectable()
export class CredentialsService {
  constructor(private mockDb: MockDatabaseService) { }

  async findAll(): Promise<any[]> {
    return this.mockDb.findAllCredentials();
  }

  async findOne(id: string): Promise<any> {
    return this.mockDb.findCredentialById(id);
  }

  async findByStudentId(studentId: string, user?: User): Promise<any[]> {
    // Student can only view their own credentials
    if (user?.role === 'student' && user.sub !== studentId) {
      throw new ForbiddenException('Bạn chỉ có thể xem văn bằng của mình');
    }
    return this.mockDb.findCredentialsByStudentId(studentId);
  }

  async findBySchoolId(schoolId: string, user?: User): Promise<any> {
    if (user?.role === 'school_admin' && user.schoolId !== schoolId) {
      throw new ForbiddenException('Bạn chỉ có thể xem văn bằng của trường mình');
    }
    const all = this.mockDb.findAllCredentials();
    return { data: all.filter(c => c.schoolId === schoolId) };
  }

  async create(data: any, user: User): Promise<any> {
    // School Admin can only create credential for their school
    if (user.role === 'school_admin') {
      if (!user.schoolId) {
        throw new ForbiddenException('School Admin cần có schoolId');
      }
      data.schoolId = user.schoolId;
    }
    return this.mockDb.createCredential(data);
  }

  async update(id: string, data: any): Promise<any> {
    // Credentials are immutable - cannot be updated after creation
    throw new BadRequestException('Văn bằng không thể sửa sau khi tạo');
  }

  async revoke(id: string, user?: User): Promise<any> {
    const credential = this.mockDb.findCredentialById(id);
    if (!credential) {
      throw new NotFoundException('Không tìm thấy văn bằng');
    }

    if (credential.status === 'revoked') {
      throw new BadRequestException('Văn bằng đã bị thu hồi trước đó');
    }

    if (user?.role === 'school_admin' && user.schoolId !== credential.schoolId) {
      throw new ForbiddenException('Bạn chỉ có thể thu hồi văn bằng của trường mình');
    }

    const now = new Date();
    this.mockDb.updateCredential(id, { 
      status: 'revoked' as any,
      updatedAt: now 
    });

    return { 
      success: true, 
      message: 'Đã thu hồi văn bằng', 
      status: 'revoked',
      updatedAt: now
    };
  }

  async confirm(id: string, data: { txHash?: string; tokenId?: string }, user?: User): Promise<any> {
    const credential = this.mockDb.findCredentialById(id);
    if (!credential) {
      throw new NotFoundException('Không tìm thấy văn bằng');
    }

    if (credential.status !== 'issued') {
      throw new BadRequestException('Văn bằng phải ở trạng thái issued mới có thể xác nhận');
    }

    if (user?.role === 'school_admin' && user.schoolId !== credential.schoolId) {
      throw new ForbiddenException('Bạn chỉ có thể xác nhận văn bằng của trường mình');
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

  async findByVerifyCode(code: string): Promise<any> {
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