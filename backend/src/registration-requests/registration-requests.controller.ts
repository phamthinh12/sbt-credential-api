import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegistrationRequestsService } from './registration-requests.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@ApiTags('registration-requests')
@Controller('registration-requests')
export class RegistrationRequestsController {
  constructor(
    private readonly registrationRequestsService: RegistrationRequestsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Gửi yêu cầu đăng ký mới (API #3)' })
  create(@Body() createDto: CreateRegistrationDto) {
    return this.registrationRequestsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu đăng ký (API #6)' })
  findAll() {
    return this.registrationRequestsService.findAll();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu đang chờ xử lý' })
  findPending() {
    return this.registrationRequestsService.findPending();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một yêu cầu đăng ký' })
  findOne(@Param('id') id: string) {
    return this.registrationRequestsService.findOne(id);
  }
}
