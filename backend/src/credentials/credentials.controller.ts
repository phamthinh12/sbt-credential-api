import { Controller, Get, Post, Put, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';

@ApiTags('credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private credentialsService: CredentialsService) { }

  @Get()

  @Get()
  @ApiOperation({ summary: 'Get all credentials' })
  findAll() {
    return this.credentialsService.findAll();
  }

  @Get(':id')
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
  @UseInterceptors(FileInterceptor('file')) // Interceptor để bắt file từ request
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
    @UploadedFile() file: Express.Multer.File, // File PDF được upload lên
  ) {
    // Gọi logic so sánh hash SHA-256 đã viết ở Service
    return this.credentialsService.verifyFileIntegrity(code, file.buffer);
  }

  @Post()
  @ApiOperation({ summary: 'Issue new credential' })
  create(@Body() createCredentialDto: CreateCredentialDto) {
    return this.credentialsService.create(createCredentialDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update credential status' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.credentialsService.update(id, data);
  }

}
