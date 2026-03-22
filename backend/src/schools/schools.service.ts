import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SchoolRepository } from '../common/repositories/school.repository';
import { StudentRepository } from '../common/repositories/student.repository';
import { RegistrationRequestRepository } from '../common/repositories/registration-request.repository';

interface User {
  userId: string;
  username: string;
  role: string;
  schoolId?: string;
}

@Injectable()
export class SchoolsService {
    constructor(
        private schoolRepository: SchoolRepository,
        private studentRepository: StudentRepository,
        private registrationRequestRepository: RegistrationRequestRepository,
    ) { }

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

    async update(id: string, data: { name?: string; email?: string }, user: User) {
        const school = await this.schoolRepository.findById(id);
        if (!school) {
            throw new NotFoundException('Không tìm thấy trường');
        }

        if (user.role === 'super_admin' || user.schoolId === id) {
            const updated = await this.schoolRepository.update(id, data);
            return { data: updated };
        }

        throw new ForbiddenException('Không có quyền cập nhật trường này');
    }

    async delete(id: string, user: User) {
        if (user.role !== 'super_admin') {
            throw new ForbiddenException('Chỉ Super Admin mới có thể xóa trường');
        }

        const school = await this.schoolRepository.findById(id);
        if (!school) {
            throw new NotFoundException('Không tìm thấy trường');
        }

        await this.registrationRequestRepository.deleteBySchoolId(id);
        
        await this.studentRepository.deleteBySchoolId(id);
        
        await this.schoolRepository.delete(id);
        
        return { message: 'Xóa trường thành công' };
    }
}
