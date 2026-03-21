import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CredentialRepository } from '../common/repositories/credential.repository';
import { StudentRepository } from '../common/repositories/student.repository';
import { IpfsService } from '../blockchain/ipfs.service';
import { BlockchainService, MintDiplomaParams } from '../blockchain/blockchain.service';
import { SimpleQueueService } from '../queue/simple-queue.service';
import { CredentialStatus } from '../common/entities/credential.entity';
import * as crypto from 'crypto';

interface User {
  userId: string;
  username: string;
  role: string;
  schoolId?: string;
}

@Injectable()
export class CredentialsService {
  constructor(
    private credentialRepository: CredentialRepository,
    private studentRepository: StudentRepository,
    private ipfsService: IpfsService,
    private blockchainService: BlockchainService,
    private simpleQueueService: SimpleQueueService,
  ) { }

  async findAll(user?: User): Promise<any> {
    let credentials = await this.credentialRepository.findAll();
    const now = new Date();
    
    credentials = await Promise.all(credentials.map(async (cred: any) => {
      if (cred.expiryDate && new Date(cred.expiryDate) < now && cred.status === 'confirmed') {
        await this.credentialRepository.update(cred.id, { status: CredentialStatus.EXPIRED });
        return { ...cred, status: 'expired' };
      }
      return cred;
    }));

    if (user?.role === 'school_admin') {
      credentials = credentials.filter((c: any) => c.schoolId === user.schoolId);
    }

    return { data: credentials };
  }

  async findOne(id: string): Promise<any> {
    const credential = await this.credentialRepository.findById(id);
    if (!credential) {
      throw new NotFoundException('Không tìm thấy văn bằng');
    }
    return credential;
  }

  async findByStudentId(studentId: string, user?: User): Promise<any[]> {
    if (user?.role === 'student' && user.userId !== studentId) {
      throw new ForbiddenException('Bạn chỉ có thể xem văn bằng của mình');
    }
    return this.credentialRepository.findByStudentId(studentId);
  }

  async findBySchoolId(schoolId: string, user?: User): Promise<any> {
    if (user?.role === 'school_admin' && user.schoolId !== schoolId) {
      throw new ForbiddenException('Bạn chỉ có thể xem văn bằng của trường mình');
    }
    const credentials = await this.credentialRepository.findBySchoolId(schoolId);
    return { data: credentials };
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
    
    console.log('[Credential] ipfsService isConfigured:', this.ipfsService.isConfigured());
    
    try {
      if (this.ipfsService.isConfigured()) {
        console.log('[Credential] Uploading to IPFS...');
        ipfsResult = await this.ipfsService.uploadFile(file.buffer, file.originalname);
        ipfsHash = ipfsResult.cid;
        console.log('[Credential] IPFS upload success:', ipfsHash);
      } else {
        console.log('[Credential] IPFS not configured, skipping upload');
      }
    } catch (error) {
      console.error('IPFS upload failed:', error.message);
    }

    const graduationYear = body.expiryDate ? new Date(body.expiryDate).getFullYear() : new Date().getFullYear();
    const verifyCode = await this.credentialRepository.generateVerifyCode();

    const credentialData: any = {
      studentId: body.studentId,
      schoolId: user.schoolId,
      name: body.name,
      description: body.description || '',
      classification: body.classification || '',
      major: body.major || '',
      issuerName: body.issuerName || '',
      fileHash: fileHash,
      ipfsHash: ipfsHash,
      ipfsUrl: ipfsResult?.url || null,
      expiryDate: body.expiryDate || null,
      verifyCode,
      status: CredentialStatus.PENDING,
    };

    const credential = await this.credentialRepository.create(credentialData);

    const student = await this.studentRepository.findById(body.studentId);

    const mintParams: MintDiplomaParams = {
      recipient: student?.walletAddress || '',
      studentId: student?.studentCode || body.studentId,
      studentName: student?.name || body.name,
      degreeTitle: body.name,
      ipfsCID: ipfsHash || '',
      documentHash: fileHash,
      graduationYear: graduationYear,
      remarks: body.description || '',
    };

    this.simpleQueueService.addMintJob(credential.id, mintParams);

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

  async revoke(id: string, user?: User): Promise<any> {
    const credential = await this.credentialRepository.findById(id);
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
    await this.credentialRepository.update(id, { 
      status: CredentialStatus.REVOKED,
      updatedAt: now 
    });

    return { 
      success: true, 
      message: 'Đã thu hồi văn bằng', 
      status: 'revoked',
      updatedAt: now
    };
  }

  async findByVerifyCode(code: string): Promise<any> {
    const credential = await this.credentialRepository.findByVerifyCode(code);

    if (!credential) {
      throw new NotFoundException('Mã xác minh không tồn tại');
    }

    return credential;
  }

  async verifyFileIntegrity(code: string, fileBuffer: Buffer) {
    const credential = await this.findByVerifyCode(code);

    if (credential.status === CredentialStatus.REVOKED) {
      return {
        isValid: false,
        message: 'Văn bằng đã bị thu hồi',
        status: 'revoked',
        metadata: {
          studentName: credential.student?.name,
          credentialName: credential.name,
        }
      };
    }

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
