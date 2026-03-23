import { Controller, Get, Post, Patch, Body, Param, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private credentialsService: CredentialsService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Lấy danh sách văn bằng (API #16) - School xem của trường, Admin xem tất cả' })
  findAll(@Request() req: any) {
    return this.credentialsService.findAll(req.user);
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({ summary: 'Lấy văn bằng theo student (API #18) - Student xem văn bằng của mình' })
  findByStudent(@Param('studentId') studentId: string, @Request() req: any) {
    return this.credentialsService.findByStudentId(studentId, req.user);
  }

  @Get('school/:schoolId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin')
  @ApiOperation({ summary: 'Lấy văn bằng theo school (API #19) - School Admin xem văn bằng của trường' })
  findBySchool(@Param('schoolId') schoolId: string, @Request() req: any) {
    return this.credentialsService.findBySchoolId(schoolId, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết văn bằng (API #20) - Public' })
  findOne(@Param('id') id: string) {
    return this.credentialsService.findOne(id);
  }

  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify credential by code (API #22) - Public' })
  findByVerifyCode(@Param('code') code: string) {
    return this.credentialsService.findByVerifyCode(code);
  }

  @Post('verify-file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Verify credential integrity by PDF file (API #21)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        verifyCode: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async verifyFile(
    @Body('verifyCode') code: string,
    @UploadedFile() file: any,
  ) {
    console.log('[VERIFY-FILE] Received request');
    console.log('[VERIFY-FILE] verifyCode:', code);
    console.log('[VERIFY-FILE] file:', file ? { originalname: file.originalname, size: file.size, mimetype: file.mimetype } : 'NO FILE');
    console.log('[VERIFY-FILE] file.buffer length:', file?.buffer?.length);
    return this.credentialsService.verifyFileIntegrity(code, file.buffer);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cấp văn bằng (API #17) - School Admin tạo văn bằng cho sinh viên, upload file PDF' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'studentId', 'name', 'classification', 'major', 'issuerName'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'File PDF văn bằng' },
        studentId: { type: 'string', description: 'ID của sinh viên' },
        name: { type: 'string', description: 'Tên văn bằng' },
        description: { type: 'string', description: 'Mô tả' },
        classification: { type: 'string', description: 'Xếp loại' },
        major: { type: 'string', description: 'Chuyên ngành' },
        issuerName: { type: 'string', description: 'Tên đơn vị cấp' },
        expiryDate: { type: 'string', description: 'Ngày hết hạn (YYYY-MM-DD)' },
      },
    },
  })
  async create(
    @UploadedFile() file: any,
    @Body() body: any,
    @Request() req: any,
  ) {
    return this.credentialsService.createWithFile(file, body, req.user);
  }

  @Patch(':id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('school_admin')
  @ApiOperation({ summary: 'Thu hồi văn bằng (API #23) - School Admin thu hồi văn bằng của trường mình' })
  revoke(@Param('id') id: string, @Request() req: any) {
    return this.credentialsService.revoke(id, req.user);
  }
}
