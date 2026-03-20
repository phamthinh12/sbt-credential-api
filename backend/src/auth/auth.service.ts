import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../common/repositories/user.repository';
import { StudentRepository } from '../common/repositories/student.repository';
import { SchoolRepository } from '../common/repositories/school.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
    private studentRepository: StudentRepository,
    private schoolRepository: SchoolRepository,
  ) { }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (isValid) {
      return { id: user.id, username: user.username, role: user.role };
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
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async loginWithWallet(walletAddress: string) {
    const student = await this.studentRepository.findByWalletAddress(walletAddress);
    if (student) {
      const payload = {
        sub: student.id,
        role: 'student',
        schoolId: student.schoolId,
        walletAddress: student.walletAddress,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: student.id,
          name: student.name,
          role: 'student',
          schoolId: student.schoolId,
          walletAddress: student.walletAddress,
        },
      };
    }

    const school = await this.schoolRepository.findByWalletAddress(walletAddress);
    if (school) {
      const payload = {
        sub: school.id,
        role: 'school_admin',
        schoolId: school.id,
        walletAddress: school.walletAddress,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: school.id,
          name: school.name,
          role: 'school_admin',
          schoolId: school.id,
          walletAddress: school.walletAddress,
        },
      };
    }

    throw new UnauthorizedException('Wallet chưa được đăng ký trong hệ thống');
  }
}
