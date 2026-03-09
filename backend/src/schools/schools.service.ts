import { Injectable, NotFoundException } from '@nestjs/common';
import { MockDatabaseService } from '../common/services/mock-database.service';

@Injectable()
export class SchoolsService {
    constructor(private mockDb: MockDatabaseService) { }

    // API #13: Lấy danh sách tất cả trường
    findAll() {
        const schools = this.mockDb.findAllSchools();
        return { data: schools }; // Bọc trong "data" theo chuẩn team Frontend
    }

    // API #14: Xem chi tiết một trường
    findOne(id: string) {
        const school = this.mockDb.findSchoolById(id);
        if (!school) {
            throw new NotFoundException(`Không tìm thấy trường với id: ${id}`);
        }
        return school;
    }
}