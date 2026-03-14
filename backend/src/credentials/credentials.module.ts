import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({ name: 'credential-mint' }),
  ],
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
