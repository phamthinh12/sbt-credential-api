import { Module } from '@nestjs/common';
import { SimpleQueueService } from './simple-queue.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { MockDatabaseModule } from '../common/mock-database.module';

@Module({
  imports: [BlockchainModule, MockDatabaseModule],
  providers: [SimpleQueueService],
  exports: [SimpleQueueService],
})
export class SimpleQueueModule {}
