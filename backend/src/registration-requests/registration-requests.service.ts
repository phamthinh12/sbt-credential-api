import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MockDatabaseService } from '../common/services/mock-database.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Injectable()
export class RegistrationRequestsService {
  constructor(private readonly mockDb: MockDatabaseService) {}

  create(createDto: CreateRegistrationDto) {
    const existingRequest = this.mockDb.findRegistrationRequestByWalletAddress(
      createDto.walletAddress,
    );

    if (existingRequest && existingRequest.status === 'pending') {
      throw new BadRequestException('Địa chỉ ví này đã có yêu cầu đăng ký đang chờ xử lý');
    }

    const request = this.mockDb.createRegistrationRequest({
      walletAddress: createDto.walletAddress,
      type: createDto.type,
      schoolName: createDto.schoolName,
      schoolDocument: createDto.schoolDocument,
      studentCode: createDto.studentCode,
      schoolId: createDto.schoolId,
    });

    return {
      data: request,
      message: 'Yêu cầu đăng ký đã được gửi thành công',
    };
  }

  findAll(type?: 'school' | 'student') {
    let requests = this.mockDb.findAllRegistrationRequests();
    
    if (type) {
      requests = requests.filter(r => r.type === type);
    }
    
    return { data: requests };
  }

  findPending() {
    const requests = this.mockDb.findRegistrationRequestsByStatus('pending');
    return { data: requests };
  }

  findOne(id: string) {
    const request = this.mockDb.findRegistrationRequestById(id);
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu đăng ký');
    }
    return { data: request };
  }

  approve(id: string) {
    const request = this.mockDb.findRegistrationRequestById(id);
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu đăng ký');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Yêu cầu đã được xử lý trước đó');
    }

    this.mockDb.updateRegistrationRequest(id, { status: 'approved' });

    if (request.type === 'student' && request.studentCode) {
      this.mockDb.createStudent({
        name: request.schoolName || 'Sinh viên mới',
        email: `${request.studentCode.toLowerCase()}@student.edu`,
        walletAddress: request.walletAddress,
        studentCode: request.studentCode,
        schoolId: request.schoolId || 'school-001',
        status: 'active',
      });
    }

    return {
      data: this.mockDb.findRegistrationRequestById(id),
      message: 'Yêu cầu đã được phê duyệt',
    };
  }

  reject(id: string) {
    const request = this.mockDb.findRegistrationRequestById(id);
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu đăng ký');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Yêu cầu đã được xử lý trước đó');
    }

    this.mockDb.updateRegistrationRequest(id, { status: 'rejected' });

    return {
      data: this.mockDb.findRegistrationRequestById(id),
      message: 'Yêu cầu đã bị từ chối',
    };
  }
}
