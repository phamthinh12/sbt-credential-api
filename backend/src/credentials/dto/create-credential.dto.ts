import { IsString, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCredentialDto {
  @ApiProperty({ example: 'student-001', description: 'ID của sinh viên' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 'Cử nhân Công nghệ Thông tin', description: 'Tên văn bằng' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Hoàn thành chương trình đào tạo', description: 'Mô tả' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Giỏi', description: 'Xếp loại' })
  @IsString()
  @IsNotEmpty()
  classification: string;

  @ApiProperty({ example: 'Công nghệ phần mềm', description: 'Ngành học' })
  @IsString()
  @IsNotEmpty()
  major: string;

  @ApiProperty({ example: 'Đại học Bách Khoa', description: 'Tên đơn vị cấp' })
  @IsString()
  @IsNotEmpty()
  issuerName: string;

  @ApiProperty({ example: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef12345678', description: 'Hash của file PDF' })
  @IsString()
  @IsNotEmpty()
  fileHash: string;

  @ApiProperty({ example: '2027-01-15', description: 'Ngày hết hạn' })
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ipfsHash?: string;
}
