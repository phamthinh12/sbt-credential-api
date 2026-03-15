import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { AuthModule } from '../auth/auth.module';
import { SimpleQueueModule } from '../queue/simple-queue.module';

@Module({
  imports: [
    AuthModule,
    SimpleQueueModule,
  ],
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
