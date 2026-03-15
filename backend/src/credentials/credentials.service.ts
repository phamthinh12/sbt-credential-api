import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MockDatabaseService } from '../common/services/mock-database.service';
import { MintCredentialJobData } from '../queue/credential.processor';
import { IpfsService } from '../blockchain/ipfs.service';
import * as crypto from 'crypto';

interface User {
  userId: string;
  sub?: string;
  username: string;
  role: string;
  schoolId?: string;
}

interface CreateCredentialData {
  studentId: string;
  name: string;
  description?: string;
  classification?: string;
  major?: string;
  issuerName?: string;
  expiryDate?: string;
  schoolId?: string;
}

@Injectable()
export class CredentialsService {
  constructor(
    private mockDb: MockDatabaseService,
    @InjectQueue('credential-mint') private mintQueue: Queue,
    private ipfsService: IpfsService,
  ) { }

  async findAll(user?: User): Promise<any> {
    let credentials = this.mockDb.findAllCredentials();
    const now = new Date();
    
    credentials = credentials.map(cred => {
      if (cred.expiryDate && new Date(cred.expiryDate) < now && cred.status === 'confirmed') {
        this.mockDb.updateCredential(cred.id, { status: 'expired' as any });
        return { ...cred, status: 'expired' };
      }
      return cred;
    });

    if (user?.role === 'school_admin') {
      credentials = credentials.filter(c => c.schoolId === user.schoolId);
    }

    return { data: credentials };
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

  async createWithFile(file: any, body: any, user: User): Promise<any> {
    if (user.role === 'school_admin') {
      if (!user.schoolId) {
        throw new ForbiddenException('School Admin cần có schoolId');
      }
    }

    if (!file) {
      throw new BadRequestException('Vui lòng upload file PDF văn bằng');
    }

    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    
    let ipfsResult = null;
    let ipfsHash = null;
    
    try {
      if (this.ipfsService.isConfigured()) {
        ipfsResult = await this.ipfsService.uploadFile(file.buffer, file.originalname);
        ipfsHash = ipfsResult.cid;
      }
    } catch (error) {
      console.error('IPFS upload failed:', error.message);
    }

    const graduationYear = body.expiryDate ? new Date(body.expiryDate).getFullYear() : new Date().getFullYear();

    const credentialData = {
      studentId: body.studentId,
      name: body.name,
      description: body.description || '',
      classification: body.classification || '',
      major: body.major || '',
      issuerName: body.issuerName || '',
      fileHash: fileHash,
      ipfsHash: ipfsHash,
      expiryDate: body.expiryDate || null,
      schoolId: user.schoolId,
    };

    const credential = this.mockDb.createCredential(credentialData);

    const student = this.mockDb.findStudentById(body.studentId);

    const jobData: MintCredentialJobData = {
      credentialId: credential.id,
      studentId: student?.studentCode || body.studentId,
      studentName: student?.name || body.name,
      degreeTitle: body.name,
      recipientWallet: student?.walletAddress || '',
      ipfsCID: ipfsHash || '',
      documentHash: fileHash,
      graduationYear: graduationYear,
      schoolId: credential.schoolId,
      remarks: body.description || '',
    };

    this.mintQueue.add('mint-credential', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    return {
      id: credential.id,
      studentId: credential.studentId,
      name: credential.name,
      status: credential.status,
      verifyCode: credential.verifyCode,
      fileHash: fileHash,
      ipfsHash: ipfsHash,
      ipfsUrl: ipfsResult?.url || null,
      createdAt: credential.createdAt,
      message: 'Văn bằng đang được xác nhận trên blockchain'
    };
  }

  private generateDocumentHash(data: CreateCredentialData): string {
    const content = `${data.studentId}-${data.name}-${Date.now()}`;
    return crypto.createHash('sha256').update(content).digest('hex');
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