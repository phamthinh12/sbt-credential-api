import { Module } from '@nestjs/common';
import { SimpleQueueService } from './simple-queue.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DatabaseModule } from '../common/database.module';

@Module({
  imports: [BlockchainModule, DatabaseModule],
  providers: [SimpleQueueService],
  exports: [SimpleQueueService],
})
export class SimpleQueueModule {}
