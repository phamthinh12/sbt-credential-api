import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin')
  @ApiOperation({ summary: 'Lấy danh sách sinh viên (API #12) - School Admin xem của trường mình' })
  @ApiQuery({ name: 'schoolId', required: false })
  findAll(@Request() req: any, @Query('schoolId') schoolId?: string) {
    const user = req.user;
    return this.studentsService.findAll(user, schoolId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xem chi tiết sinh viên (API #13)' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin', 'student')
  @ApiOperation({ summary: 'Cập nhật thông tin sinh viên (API #14) - School Admin hoặc chính Student' })
  update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.studentsService.update(id, data, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin')
  @ApiOperation({ summary: 'Xóa sinh viên (API #15) - School Admin xóa sinh viên của trường mình' })
  delete(@Param('id') id: string, @Request() req: any) {
    return this.studentsService.delete(id, req.user);
  }
}
