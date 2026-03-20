import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  User,
  School,
  Student,
  Credential,
  RegistrationRequest,
} from './entities';
import {
  UserRepository,
  SchoolRepository,
  StudentRepository,
  CredentialRepository,
  RegistrationRequestRepository,
} from './repositories';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [User, School, Student, Credential, RegistrationRequest],
            synchronize: true,
            logging: configService.get('NODE_ENV') !== 'production',
          };
        }
        
        return {
          type: 'sqlite',
          database: 'database.sqlite',
          entities: [User, School, Student, Credential, RegistrationRequest],
          synchronize: true,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, School, Student, Credential, RegistrationRequest]),
  ],
  providers: [
    UserRepository,
    SchoolRepository,
    StudentRepository,
    CredentialRepository,
    RegistrationRequestRepository,
    SeedService,
  ],
  exports: [
    UserRepository,
    SchoolRepository,
    StudentRepository,
    CredentialRepository,
    RegistrationRequestRepository,
    TypeOrmModule,
  ],
})
export class DatabaseModule {}
