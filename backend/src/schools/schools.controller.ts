import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MockDatabaseService } from '../common/services/mock-database.service';

@ApiTags('schools')
@Controller('schools')
export class SchoolsController {
    constructor(private mockDb: MockDatabaseService) { }

    @Get() // Đảm bảo decorator này nằm NGAY TRÊN hàm findAll 
    @ApiOperation({ summary: 'Lấy danh sách tất cả trường (API #13)' })
    findAll() {
        return { data: this.mockDb.findAllSchools() };
    }

    @Get(':id') // Không được có code xen giữa decorator và hàm 
    @ApiOperation({ summary: 'Xem chi tiết một trường (API #14)' })
    findOne(@Param('id') id: string) {
        const school = this.mockDb.findSchoolById(id);
        if (!school) throw new NotFoundException('Không tìm thấy trường học');
        return school;
    }
}