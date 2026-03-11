import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RegistrationRequestsService } from './registration-requests.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@ApiTags('registration-requests')
@Controller('registration-requests')
export class RegistrationRequestsController {
  constructor(
    private readonly registrationRequestsService: RegistrationRequestsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo yêu cầu đăng ký mới (API #3)' })
  create(@Body() createDto: CreateRegistrationDto) {
    return this.registrationRequestsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu đăng ký (API #4, #5, #6)' })
  @ApiQuery({ name: 'type', required: false, enum: ['school', 'student'] })
  findAll(@Query('type') type?: 'school' | 'student') {
    return this.registrationRequestsService.findAll(type);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu đang chờ xử lý' })
  findPending() {
    return this.registrationRequestsService.findPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một yêu cầu đăng ký (API #6)' })
  findOne(@Param('id') id: string) {
    return this.registrationRequestsService.findOne(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Phê duyệt yêu cầu đăng ký (API #7)' })
  approve(@Param('id') id: string) {
    return this.registrationRequestsService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Từ chối yêu cầu đăng ký (API #8)' })
  reject(@Param('id') id: string) {
    return this.registrationRequestsService.reject(id);
  }
}
