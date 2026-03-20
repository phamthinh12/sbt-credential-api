import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { SchoolRepository } from './repositories/school.repository';
import { StudentRepository } from './repositories/student.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private userRepository: UserRepository,
    private schoolRepository: SchoolRepository,
    private studentRepository: StudentRepository,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    
    if (databaseUrl) {
      console.log('[SeedService] Seeding database...');
      await this.seedDefaultData();
      console.log('[SeedService] Database seeded successfully');
    }
  }

  private async seedDefaultData() {
    await this.userRepository.seedDefaultAdmin();
    await this.schoolRepository.seedDefaultSchool();
    await this.studentRepository.seedDefaultStudent();
  }
}
