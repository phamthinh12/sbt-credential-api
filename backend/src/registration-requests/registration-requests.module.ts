import { Module } from '@nestjs/common';
import { RegistrationRequestsController } from './registration-requests.controller';
import { RegistrationRequestsService } from './registration-requests.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../common/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [RegistrationRequestsController],
  providers: [RegistrationRequestsService],
  exports: [RegistrationRequestsService],
})
export class RegistrationRequestsModule {}
