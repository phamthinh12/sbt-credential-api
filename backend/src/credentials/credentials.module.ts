import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { MockDatabaseService } from '../common/services/mock-database.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CredentialsController],
  providers: [CredentialsService, MockDatabaseService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
