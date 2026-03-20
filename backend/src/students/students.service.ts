import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { StudentRepository } from '../common/repositories/student.repository';

interface User {
  userId: string;
  username: string;
  role: string;
  schoolId?: string;
}

@Injectable()
export class StudentsService {
  constructor(private studentRepository: StudentRepository) {}

  async findAll(user: User, schoolId?: string): Promise<{ data: any[] }> {
    let students: any[];
    
    if (user.role === 'super_admin') {
      if (schoolId) {
        students = await this.studentRepository.findBySchoolId(schoolId);
      } else {
        students = await this.studentRepository.findAll();
      }
    } else if (user.role === 'school_admin') {
      if (!user.schoolId) {
        throw new ForbiddenException('School Admin cần có schoolId');
      }
      const targetSchoolId = schoolId || user.schoolId;
      if (schoolId && schoolId !== user.schoolId) {
        throw new ForbiddenException('Bạn chỉ có thể xem học sinh của trường mình');
      }
      students = await this.studentRepository.findBySchoolId(targetSchoolId);
    } else {
      students = [];
    }
    
    return { data: students };
  }

  async findOne(id: string): Promise<{ data: any }> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }
    return { data: student };
  }

  async update(id: string, data: any, user: User): Promise<{ data: any }> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }
    
    if (user.role === 'school_admin' && user.schoolId !== student.schoolId) {
      throw new ForbiddenException('Bạn chỉ có thể cập nhật sinh viên của trường mình');
    }
    
    const updated = await this.studentRepository.update(id, data);
    return { data: updated };
  }

  async delete(id: string): Promise<{ message: string }> {
    const deleted = await this.studentRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }
    return { message: 'Xóa sinh viên thành công' };
  }
}
