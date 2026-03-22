import { Controller, Get, Delete, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SchoolsService } from './schools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('schools')
@Controller('schools')
export class SchoolsController {
    constructor(private schoolsService: SchoolsService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả trường (API #9)' })
    findAll() {
        return this.schoolsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Xem chi tiết một trường (API #10)' })
    async findOne(@Param('id') id: string) {
        return this.schoolsService.findOne(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin')
    @ApiOperation({ summary: 'Xóa trường (API #11) - Super Admin only' })
    delete(@Param('id') id: string, @Request() req: any) {
        return this.schoolsService.delete(id, req.user);
    }
}
