import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Get all credentials' })
  findAll() {
    return this.credentialsService.findAll();
  }

  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy văn bằng theo student (API #21)' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.credentialsService.findByStudentId(studentId);
  }

  @Get('school/:schoolId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Lấy văn bằng theo school (API #22)' })
  findBySchool(@Param('schoolId') schoolId: string) {
    return this.credentialsService.findBySchoolId(schoolId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get credential by ID' })
  findOne(@Param('id') id: string) {
    return this.credentialsService.findOne(id);
  }

  @Get('verify/:code')
  @ApiOperation({ summary: 'Get credential by verify code (public)' })
  findByVerifyCode(@Param('code') code: string) {
    return this.credentialsService.findByVerifyCode(code);
  }

  @Post('verify-file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Verify credential integrity by PDF file' })
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
    return this.credentialsService.verifyFileIntegrity(code, file.buffer);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Issue new credential' })
  create(@Body() createCredentialDto: CreateCredentialDto) {
    return this.credentialsService.create(createCredentialDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Update credential status' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.credentialsService.update(id, data);
  }

  @Patch(':id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Thu hồi văn bằng (API #19)' })
  revoke(@Param('id') id: string) {
    return this.credentialsService.revoke(id);
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Xác nhận văn bằng (API #20)' })
  confirm(@Param('id') id: string, @Body() data: { txHash?: string; tokenId?: string }) {
    return this.credentialsService.confirm(id, data);
  }
}
