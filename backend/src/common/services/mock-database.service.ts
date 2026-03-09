import { Injectable } from '@nestjs/common';
import { Student } from '../../students/entities/student.entity';
import { Credential } from '../../credentials/entities/credential.entity';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class MockDatabaseService {
  private users: User[] = [];
  private students: Student[] = [];
  private credentials: Credential[] = [];
  private registrationRequests: any[] = [];
  private idCounter = 1;

  constructor() {
    this.seedData();
  }

  private schools: any[] = [];

  private seedData() {
    // 1. Đồng bộ User
    this.users = [
      {
        id: 'super-admin-001',
        username: 'admin',
        passwordHash: '$2b$10$xVqYLGQKkL8ZqJ3Q5kHzKOqY3Q5kHzKOqY3Q5kHzKOqY3Q5kHzKOq',
        role: 'super_admin' as any, // Khớp role super_admin
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // 2. Đồng bộ Students (Thêm trường schoolId)
    this.students = [
      {
        id: 'student-001',
        schoolId: 'school-001', // Link tới Đại học Bách Khoa
        userId: 'user-student-001',
        name: 'Nguyễn Văn A',
        email: 'a.nguyenvan@example.com',
        walletAddress: '0x1111111111111111111111111111111111111111',
        studentCode: 'SV001',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'student-002',
        schoolId: 'school-001',
        userId: 'user-student-002',
        name: 'Trần Thị B',
        email: 'b.tranthi@example.com',
        walletAddress: '0x2222222222222222222222222222222222222222',
        studentCode: 'SV002',
        status: 'active',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
    ];
    this.schools = [
      { id: 'school-001', name: 'Đại học Bách Khoa', walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1', isActive: true },
      { id: 'school-002', name: 'Đại học Kinh Tế', walletAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA7', isActive: true },
    ];

    // 3. Đồng bộ Credentials (Thêm metadata Blockchain)
    this.credentials = [
      {
        id: 'cred-001',
        studentId: 'student-001',
        schoolId: 'school-001',
        name: 'Cử nhân Công nghệ Thông tin',
        description: 'Hoàn thành chương trình đào tạo Cử nhân Công nghệ Thông tin',
        status: 'confirmed',
        txHash: '0xabc123def456789',
        tokenId: '1',
        verifyCode: 'CRED-20240115-ABC123',
        issuedAt: new Date('2024-01-15') as any,
        ipfsHash: 'QmXyZ1234567890abcdef',
        fileHash: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef12345678',
        student: { name: 'Nguyễn Văn A', email: 'a.nguyenvan@example.com' } as any,
        classification: 'Giỏi',
        major: 'Công nghệ phần mềm',
        issuerName: 'Trường Đại học Bách Khoa',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'cred-005',
        studentId: 'student-004', // Phạm Thị D
        schoolId: 'school-002', // Đại học Kinh Tế
        name: 'Chứng chỉ Blockchain Basics',
        description: 'Hoàn thành khóa học Blockchain Basics',
        status: 'confirmed',
        txHash: '0xaaa111bbb222ccc',
        tokenId: '4',
        verifyCode: 'CRED-20240215-MNO456',
        issuedAt: new Date('2024-02-15') as any,
        ipfsHash: 'QmXyZ5555666677777888',
        fileHash: 'd4e5f678901234567890abcdef01234567890abcdef01234567890a',
        student: { name: 'Phạm Thị D', email: 'd.phamthi@example.com' } as any,
        classification: 'Xuất sắc',
        major: 'Công nghệ Blockchain',
        issuerName: 'Trường Đại học Kinh Tế',
        expiryDate: '2027-02-15' as any,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15'),
      }
    ];

    // 4. Đồng bộ Registration Requests
    this.registrationRequests = [
      {
        id: 'req-001',
        walletAddress: '0x9999999999999999999999999999999999999999',
        type: 'school',
        schoolName: 'Đại học FPT',
        status: 'pending'
      },
    ];
  }

  findAllUsers(): User[] {
    return this.users;
  }

  findUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  findUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  findAllStudents(): Student[] {
    return this.students;
  }

  findStudentById(id: string): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  findStudentByEmail(email: string): Student | undefined {
    return this.students.find(s => s.email === email);
  }

  createStudent(data: Partial<Student>): Student {
    const student: Student = {
      id: `student-${String(this.idCounter++).padStart(3, '0')}`,
      schoolId: data.schoolId || 'school-001',
      userId: data.userId || null,
      name: data.name,
      email: data.email,
      walletAddress: data.walletAddress || null,
      studentCode: data.studentCode || `SV${String(this.idCounter).padStart(3, '0')}`,
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.students.push(student);
    return student;
  }

  updateStudent(id: string, data: Partial<Student>): Student | undefined {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.students[index] = { ...this.students[index], ...data, updatedAt: new Date() };
    return this.students[index];
  }

  deleteStudent(id: string): boolean {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.students.splice(index, 1);
    return true;
  }

  findAllCredentials(): Credential[] {
    return this.credentials.map(cred => ({
      ...cred,
      student: this.students.find(s => s.id === cred.studentId)!,
    }));
  }

  findCredentialById(id: string): Credential | undefined {
    const cred = this.credentials.find(c => c.id === id);
    if (!cred) return undefined;
    return {
      ...cred,
      student: this.students.find(s => s.id === cred.studentId)!,
    };
  }

  findCredentialByVerifyCode(code: string): Credential | undefined {
    const cred = this.credentials.find(c => c.verifyCode === code);
    if (!cred) return undefined;
    return {
      ...cred,
      student: this.students.find(s => s.id === cred.studentId)!,
    };
  }

  findCredentialsByStudentId(studentId: string): Credential[] {
    return this.credentials
      .filter(c => c.studentId === studentId)
      .map(cred => ({
        ...cred,
        student: this.students.find(s => s.id === cred.studentId)!,
      }));
  }

  createCredential(data: Partial<Credential>): Credential {
    const verifyCode = `CRED-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const credential: Credential = {
      id: `cred-${String(this.idCounter++).padStart(3, '0')}`,
      studentId: data.studentId,
      schoolId: data.schoolId || 'school-001',
      student: this.students.find(s => s.id === data.studentId)!,
      name: data.name,
      description: data.description || null,
      ipfsHash: data.ipfsHash || null,
      fileHash: data.fileHash || null,
      status: 'pending',
      txHash: null,
      tokenId: null,
      verifyCode,
      issuedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.credentials.push(credential);
    return credential;
  }

  updateCredential(id: string, data: Partial<Credential>): Credential | undefined {
    const index = this.credentials.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.credentials[index] = {
      ...this.credentials[index],
      ...data,
      updatedAt: new Date()
    };
    return this.findCredentialById(id);
  }
  findAllSchools() {
    return this.schools;
  }

  findSchoolById(id: string) {
    return this.schools.find(s => s.id === id);
  }
}

