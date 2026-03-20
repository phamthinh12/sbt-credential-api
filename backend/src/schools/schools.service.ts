import { Injectable, NotFoundException } from '@nestjs/common';
import { SchoolRepository } from '../common/repositories/school.repository';

@Injectable()
export class SchoolsService {
    constructor(private schoolRepository: SchoolRepository) { }

    async findAll() {
        const schools = await this.schoolRepository.findAll();
        return { data: schools };
    }

    async findOne(id: string) {
        const school = await this.schoolRepository.findById(id);
        if (!school) {
            throw new NotFoundException(`Không tìm thấy trường với id: ${id}`);
        }
        return school;
    }
}
