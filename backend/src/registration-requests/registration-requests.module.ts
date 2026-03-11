import { Module } from '@nestjs/common';
import { RegistrationRequestsController } from './registration-requests.controller';
import { RegistrationRequestsService } from './registration-requests.service';
import { MockDatabaseService } from '../common/services/mock-database.service';

@Module({
  controllers: [RegistrationRequestsController],
  providers: [RegistrationRequestsService, MockDatabaseService],
  exports: [RegistrationRequestsService],
})
export class RegistrationRequestsModule {}
