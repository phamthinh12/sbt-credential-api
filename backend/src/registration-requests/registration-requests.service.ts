import { Injectable, BadRequestException } from '@nestjs/common';
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

  findAll() {
    const requests = this.mockDb.findAllRegistrationRequests();
    return { data: requests };
  }

  findPending() {
    const requests = this.mockDb.findRegistrationRequestsByStatus('pending');
    return { data: requests };
  }

  findOne(id: string) {
    const request = this.mockDb.findRegistrationRequestById(id);
    if (!request) {
      throw new BadRequestException('Không tìm thấy yêu cầu đăng ký');
    }
    return { data: request };
  }
}
