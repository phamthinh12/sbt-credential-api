import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sinh viên (API #9)' })
  @ApiQuery({ name: 'schoolId', required: false })
  findAll(@Query('schoolId') schoolId?: string) {
    return this.studentsService.findAll(schoolId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết sinh viên (API #10)' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo sinh viên mới' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sinh viên (API #11)' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.studentsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sinh viên (API #12)' })
  delete(@Param('id') id: string) {
    return this.studentsService.delete(id);
  }
}
