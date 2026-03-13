import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MockDatabaseService } from '../common/services/mock-database.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

interface User {
  userId: string;
  username: string;
  role: string;
  schoolId?: string;
}

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
      name: createDto.name,
      email: createDto.email,
      schoolName: createDto.schoolName,
      schoolDocument: createDto.schoolDocument,
      studentCode: createDto.studentCode,
      schoolId: createDto.schoolId,
    });

    return {
      data: request,
      message: 'Yêu cầu đăng ký đã được gửi. Vui lòng chờ duyệt.',
    };
  }

  findAll(type?: 'school' | 'student', schoolId?: string, user?: User) {
    let requests = this.mockDb.findAllRegistrationRequests();
    
    if (type) {
      requests = requests.filter(r => r.type === type);
    }
    
    if (user?.role === 'school_admin' && user.schoolId) {
      requests = requests.filter(r => r.schoolId === user.schoolId);
    } else if (schoolId) {
      requests = requests.filter(r => r.schoolId === schoolId);
    }
    
    return { data: requests };
  }

  findPending(user?: User) {
    const requests = this.mockDb.findRegistrationRequestsByStatus('pending');
    
    if (user?.role === 'school_admin' && user.schoolId) {
      return { data: requests.filter(r => r.schoolId === user.schoolId) };
    }
    
    return { data: requests };
  }

  findOne(id: string) {
    const request = this.mockDb.findRegistrationRequestById(id);
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu đăng ký');
    }
    return { data: request };
  }

  approve(id: string, user?: User) {
    const request = this.mockDb.findRegistrationRequestById(id);
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu đăng ký');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Yêu cầu đã được xử lý trước đó');
    }

    this.mockDb.updateRegistrationRequest(id, { status: 'approved' });

    let result: any = { success: true, message: 'Đã duyệt yêu cầu' };

    if (request.type === 'student' && request.studentCode) {
      const student = this.mockDb.createStudent({
        name: request.name || request.schoolName || 'Sinh viên mới',
        email: request.email || `${request.studentCode.toLowerCase()}@student.edu`,
        walletAddress: request.walletAddress,
        studentCode: request.studentCode,
        schoolId: request.schoolId || 'school-001',
        status: 'active',
      });
      result.student = student;
    } else if (request.type === 'school') {
      const school = this.mockDb.createSchool({
        name: request.schoolName || request.name || 'Trường mới',
        walletAddress: request.walletAddress,
        isActive: true,
      });
      result.school = school;
    }

    return {
      ...result,
      data: this.mockDb.findRegistrationRequestById(id),
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
      success: true,
      message: 'Đã từ chối yêu cầu',
      data: this.mockDb.findRegistrationRequestById(id),
    };
  }
}
