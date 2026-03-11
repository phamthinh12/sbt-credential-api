import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { CredentialsModule } from './credentials/credentials.module';
import { EventsModule } from './events/events.module';
import { AppController } from './app.controller';
import { MockDatabaseService } from './common/services/mock-database.service';
import { SchoolsModule } from './schools/schools.module';
import { RegistrationRequestsModule } from './registration-requests/registration-requests.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    StudentsModule,
    CredentialsModule,
    EventsModule,
    SchoolsModule,
    RegistrationRequestsModule,],
  controllers: [AppController],
  providers: [MockDatabaseService],
})
export class AppModule { }
