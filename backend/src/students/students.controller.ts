import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin')
  @ApiOperation({ summary: 'Lấy danh sách sinh viên (API #9) - School Admin xem của trường mình' })
  @ApiQuery({ name: 'schoolId', required: false })
  findAll(@Request() req: any, @Query('schoolId') schoolId?: string) {
    const user = req.user;
    return this.studentsService.findAll(user, schoolId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xem chi tiết sinh viên (API #10)' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Tạo sinh viên mới - School/Admin' })
  create(@Request() req: any, @Body() createStudentDto: CreateStudentDto) {
    const user = req.user;
    return this.studentsService.create(createStudentDto, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Cập nhật thông tin sinh viên (API #11) - School/Admin' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Xóa sinh viên (API #12) - Admin only' })
  delete(@Param('id') id: string) {
    return this.studentsService.delete(id);
  }
}
