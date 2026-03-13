import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MockDatabaseService } from '../common/services/mock-database.service';

interface Student {
  id: string;
  schoolId: string;
  userId: string | null;
  name: string;
  email: string;
  walletAddress: string | null;
  studentCode: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  userId: string;
  username: string;
  role: string;
  schoolId?: string;
}

@Injectable()
export class StudentsService {
  constructor(private mockDb: MockDatabaseService) {}

  async findAll(user: User, schoolId?: string): Promise<{ data: Student[] }> {
    let students = this.mockDb.findAllStudents();
    
    if (user.role === 'super_admin') {
      if (schoolId) {
        students = students.filter(s => s.schoolId === schoolId);
      }
    } else if (user.role === 'school_admin') {
      if (!user.schoolId) {
        throw new ForbiddenException('School Admin cần có schoolId');
      }
      students = students.filter(s => s.schoolId === user.schoolId);
    }
    
    return { data: students };
  }

  async findOne(id: string): Promise<{ data: Student }> {
    const student = this.mockDb.findStudentById(id);
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }
    return { data: student };
  }

  async create(data: Partial<Student>, user: User): Promise<{ data: Student }> {
    if (user.role === 'school_admin' && user.schoolId) {
      data.schoolId = user.schoolId;
    }
    const student = this.mockDb.createStudent(data);
    return { data: student };
  }

  async update(id: string, data: Partial<Student>, user: User): Promise<{ data: Student }> {
    const student = this.mockDb.findStudentById(id);
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }
    
    // School Admin can only update students of their school
    if (user.role === 'school_admin' && user.schoolId !== student.schoolId) {
      throw new ForbiddenException('Bạn chỉ có thể cập nhật sinh viên của trường mình');
    }
    
    const updated = this.mockDb.updateStudent(id, data);
    return { data: updated };
  }

  async delete(id: string): Promise<{ message: string }> {
    const deleted = this.mockDb.deleteStudent(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }
    return { message: 'Xóa sinh viên thành công' };
  }
}
