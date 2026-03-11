import { Injectable, NotFoundException } from '@nestjs/common';
import { Student } from './entities/student.entity';
import { MockDatabaseService } from '../common/services/mock-database.service';

@Injectable()
export class StudentsService {
  constructor(private mockDb: MockDatabaseService) {}

  async findAll(schoolId?: string): Promise<{ data: Student[] }> {
    let students = this.mockDb.findAllStudents();
    
    if (schoolId) {
      students = students.filter(s => s.schoolId === schoolId);
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

  async create(data: Partial<Student>): Promise<{ data: Student }> {
    const student = this.mockDb.createStudent(data);
    return { data: student };
  }

  async update(id: string, data: Partial<Student>): Promise<{ data: Student }> {
    const student = this.mockDb.updateStudent(id, data);
    if (!student) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }
    return { data: student };
  }

  async delete(id: string): Promise<{ message: string }> {
    const deleted = this.mockDb.deleteStudent(id);
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy sinh viên');
    }
    return { message: 'Xóa sinh viên thành công' };
  }
}
