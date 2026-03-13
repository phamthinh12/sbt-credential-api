import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MockDatabaseService } from '../common/services/mock-database.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private mockDb: MockDatabaseService,
  ) { }

  async validateUser(username: string, password: string): Promise<any> {
    const user = this.mockDb.findUserByUsername(username);
    if (user && user.passwordHash && password === 'password123') {
      return { id: user.id, username: user.username, role: user.role, schoolId: user.schoolId };
    }
    return null;
  }

  async login(loginData: { username: string; password: string }) {

    const user = await this.validateUser(loginData.username, loginData.password);
    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }
    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role,
      schoolId: user.schoolId 
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId,
      },
    };
  }

  async checkWallet(walletAddress: string) {
    const student = this.mockDb.findStudentsByWalletAddress(walletAddress);
    if (student) {
      return { exists: true, role: 'student', studentId: student.id, name: student.name };
    }

    const school = this.mockDb.findSchoolByWalletAddress(walletAddress);
    if (school) {
      return { exists: true, role: 'school', schoolId: school.id, name: school.name };
    }

    const request = this.mockDb.findRegistrationRequestByWalletAddress(walletAddress);
    if (request) {
      return { exists: true, role: 'pending', requestId: request.id, status: request.status };
    }

    return { exists: false, message: 'Wallet chưa đăng ký' };
  }
}
