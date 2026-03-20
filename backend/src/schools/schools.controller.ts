import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';

@ApiTags('schools')
@Controller('schools')
export class SchoolsController {
    constructor(private schoolsService: SchoolsService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả trường (API #13)' })
    findAll() {
        return this.schoolsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Xem chi tiết một trường (API #14)' })
    async findOne(@Param('id') id: string) {
        return this.schoolsService.findOne(id);
    }
}
