import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCredentialDto {
  @ApiProperty({ example: 'student-001' })
  @IsString()
  studentId: string;

  @ApiProperty({ example: 'Certificate of Completion' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Complete course', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ipfsHash?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileHash?: string;
}
