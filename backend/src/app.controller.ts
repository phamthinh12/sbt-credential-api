import { Controller, Get } from '@nestjs/common';
import { UserRepository } from './common/repositories/user.repository';
import { StudentRepository } from './common/repositories/student.repository';
import { CredentialRepository } from './common/repositories/credential.repository';

@Controller()
export class AppController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly studentRepository: StudentRepository,
    private readonly credentialRepository: CredentialRepository,
  ) {}

  @Get()
  async getAllData() {
    return {
      users: await this.userRepository.findAll(),
      students: await this.studentRepository.findAll(),
      credentials: await this.credentialRepository.findAll(),
    };
  }
}
