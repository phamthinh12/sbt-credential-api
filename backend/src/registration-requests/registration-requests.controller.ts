import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RegistrationRequestsService } from './registration-requests.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu (API #4: super_admin xem school, API #5: school_admin xem student)' })
  @ApiQuery({ name: 'type', required: false, enum: ['school', 'student'] })
  @ApiQuery({ name: 'schoolId', required: false })
  findAll(
    @Request() req: any,
    @Query('type') type?: 'school' | 'student',
    @Query('schoolId') schoolId?: string,
  ) {
    return this.registrationRequestsService.findAll(type, schoolId, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một yêu cầu (API #6) - Public' })
  findOne(@Param('id') id: string) {
    return this.registrationRequestsService.findOne(id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Phê duyệt yêu cầu (API #7)' })
  approve(@Param('id') id: string, @Request() req: any) {
    return this.registrationRequestsService.approve(id, req.user);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Từ chối yêu cầu (API #8)' })
  reject(@Param('id') id: string, @Request() req: any) {
    return this.registrationRequestsService.reject(id, req.user);
  }
}
