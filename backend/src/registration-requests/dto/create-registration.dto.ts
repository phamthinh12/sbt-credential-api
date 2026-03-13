import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistrationDto {
    @ApiProperty({ example: '0x9999999999999999999999999999999999999999' })
    @IsString()
    @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Địa chỉ ví không hợp lệ' })
    walletAddress: string;

    @ApiProperty({ enum: ['school', 'student'], example: 'student' })
    @IsEnum(['school', 'student'])
    type: 'school' | 'student';

    @ApiProperty({ example: 'Nguyễn Văn A', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: 'a@email.com', required: false })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({ example: 'Đại học Bách Khoa', required: false })
    @IsOptional()
    @IsString()
    schoolName?: string;

    @ApiProperty({ example: 'QmDoc123...', required: false })
    @IsOptional()
    @IsString()
    schoolDocument?: string;

    @ApiProperty({ example: 'SV201', required: false })
    @IsOptional()
    @IsString()
    studentCode?: string;

    @ApiProperty({ example: 'school-001', required: false })
    @IsOptional()
    @IsString()
    schoolId?: string;
}