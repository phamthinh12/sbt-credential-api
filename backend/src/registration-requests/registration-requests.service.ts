import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RegistrationRequestRepository } from '../common/repositories/registration-request.repository';
import { StudentRepository } from '../common/repositories/student.repository';
import { SchoolRepository } from '../common/repositories/school.repository';
import { RegistrationRequestType, RegistrationRequestStatus } from '../common/entities/registration-request.entity';
import { StudentStatus } from '../common/entities/student.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';

interface User {
  userId: string;
  username: string;
  role: string;
  schoolId?: string;
}

@Injectable()
export class RegistrationRequestsService {
  constructor(
    private readonly registrationRequestRepository: RegistrationRequestRepository,
    private readonly studentRepository: StudentRepository,
    private readonly schoolRepository: SchoolRepository,
  ) {}

  async create(createDto: CreateRegistrationDto) {
    const existingRequest = await this.registrationRequestRepository.findByWalletAddress(
      createDto.walletAddress,
    );

    if (existingRequest && existingRequest.status === 'pending') {
      throw new BadRequestException('Địa chỉ ví này đã có yêu cầu đăng ký đang chờ xử lý');
    }

    const request = await this.registrationRequestRepository.create({
      walletAddress: createDto.walletAddress,
      type: createDto.type === 'school' ? RegistrationRequestType.SCHOOL : RegistrationRequestType.STUDENT,
      status: RegistrationRequestStatus.PENDING,
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

  async findAll(type?: 'school' | 'student', schoolId?: string, user?: User) {
    let requests = await this.registrationRequestRepository.findAll();
    
    if (type === 'school') {
      if (user?.role !== 'super_admin') {
        throw new ForbiddenException('Chỉ Super Admin mới có thể xem danh sách yêu cầu đăng ký School');
      }
      requests = requests.filter(r => r.type === 'school');
    } else if (type === 'student') {
      if (user?.role !== 'school_admin') {
        throw new ForbiddenException('Chỉ School Admin mới có thể xem danh sách yêu cầu đăng ký Student');
      }
      if (!user?.schoolId) {
        throw new ForbiddenException('School Admin cần có schoolId');
      }
      requests = requests.filter(r => r.type === 'student' && r.schoolId === user.schoolId);
    }
    
    if (user?.role === 'school_admin' && user.schoolId && !type) {
      requests = requests.filter(r => r.schoolId === user.schoolId);
    } else if (schoolId && user?.role === 'super_admin') {
      requests = requests.filter(r => r.schoolId === schoolId);
    }
    
    return { data: requests };
  }

  async findOne(id: string) {
    const request = await this.registrationRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu đăng ký');
    }
    return { data: request };
  }

  async approve(id: string, user?: User) {
    const request = await this.registrationRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu đăng ký');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Yêu cầu đã được xử lý trước đó');
    }

    if (request.type === 'student') {
      if (user?.role !== 'school_admin') {
        throw new ForbiddenException('Chỉ School Admin mới có thể duyệt yêu cầu Student');
      }
      if (user?.schoolId !== request.schoolId) {
        throw new ForbiddenException('School Admin chỉ có thể duyệt yêu cầu của trường mình');
      }
    } else if (request.type === 'school') {
      if (user?.role !== 'super_admin') {
        throw new ForbiddenException('Chỉ Super Admin mới có thể duyệt yêu cầu School');
      }
    }

    await this.registrationRequestRepository.updateStatus(id, RegistrationRequestStatus.APPROVED);

    let result: any = { success: true, message: 'Đã duyệt yêu cầu' };

    if (request.type === 'student' && request.studentCode) {
      const student = await this.studentRepository.create({
        name: request.name || request.schoolName || 'Sinh viên mới',
        email: request.email || `${request.studentCode?.toLowerCase()}@student.edu`,
        walletAddress: request.walletAddress,
        studentCode: request.studentCode,
        schoolId: request.schoolId || '',
        status: StudentStatus.ACTIVE,
      });
      result.student = student;
    } else if (request.type === 'school') {
      const school = await this.schoolRepository.create({
        name: request.schoolName || request.name || 'Trường mới',
        walletAddress: request.walletAddress,
        isActive: true,
      });
      result.school = school;
      
      // Cập nhật schoolId vào registration request
      await this.registrationRequestRepository.update(id, {
        schoolId: school.id,
        approvedAt: new Date(),
      });
    }

    return {
      ...result,
      data: await this.registrationRequestRepository.findById(id),
    };
  }

  async reject(id: string, user?: User) {
    const request = await this.registrationRequestRepository.findById(id);
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu đăng ký');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Yêu cầu đã được xử lý trước đó');
    }

    if (request.type === 'student') {
      if (user?.role !== 'school_admin') {
        throw new ForbiddenException('Chỉ School Admin mới có thể từ chối yêu cầu Student');
      }
      if (user?.schoolId !== request.schoolId) {
        throw new ForbiddenException('School Admin chỉ có thể từ chối yêu cầu của trường mình');
      }
    } else if (request.type === 'school') {
      if (user?.role !== 'super_admin') {
        throw new ForbiddenException('Chỉ Super Admin mới có thể từ chối yêu cầu School');
      }
    }

    await this.registrationRequestRepository.updateStatus(id, RegistrationRequestStatus.REJECTED);

    return {
      success: true,
      message: 'Đã từ chối yêu cầu',
      data: await this.registrationRequestRepository.findById(id),
    };
  }
}
