import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BlockchainService, MintDiplomaParams } from '../blockchain/blockchain.service';
import { CredentialRepository } from '../common/repositories/credential.repository';
import { WatcherNotifyService } from '../common/services/watcher-notify.service';
import { CredentialStatus } from '../common/entities/credential.entity';

interface QueuedMintJob {
  credentialId: string;
  data: MintDiplomaParams;
  attempts: number;
  maxAttempts: number;
}

@Injectable()
export class SimpleQueueService implements OnModuleInit {
  private readonly logger = new Logger(SimpleQueueService.name);
  private queue: QueuedMintJob[] = [];
  private isProcessing = false;
  private readonly pollInterval = 5000;
  private readonly maxAttempts = 3;

  constructor(
    private blockchainService: BlockchainService,
    private credentialRepository: CredentialRepository,
    private watcherNotify: WatcherNotifyService,
  ) {}

  onModuleInit() {
    this.logger.log('SimpleQueueService initialized - starting background processor');
    this.startProcessor();
  }

  addMintJob(credentialId: string, data: MintDiplomaParams) {
    this.queue.push({
      credentialId,
      data,
      attempts: 0,
      maxAttempts: this.maxAttempts,
    });
    this.logger.log(`Job added to queue: ${credentialId}, queue length: ${this.queue.length}`);
  }

  private startProcessor() {
    setInterval(() => {
      this.processQueue();
    }, this.pollInterval);
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const job = this.queue[0];

    try {
      this.logger.log(`Processing job: ${job.credentialId}, attempt: ${job.attempts + 1}`);
      this.logger.log(`Mint params - recipient: ${job.data.recipient}, studentId: ${job.data.studentId}`);

      if (!job.data.recipient) {
        throw new Error('Recipient wallet address is empty - cannot mint on blockchain');
      }

      await this.credentialRepository.update(job.credentialId, { status: CredentialStatus.ISSUED });

      this.watcherNotify.notifyCredentialStatusChanged(job.credentialId, 'issued').catch(() => {});

      const result = await this.blockchainService.issueDiploma(job.data);

      await this.credentialRepository.update(job.credentialId, {
        status: CredentialStatus.CONFIRMED,
        txHash: result.txHash,
        tokenId: String(result.tokenId),
        issuedAt: new Date(),
      });

      this.watcherNotify.notifyCredentialStatusChanged(job.credentialId, 'confirmed').catch(() => {});
      this.watcherNotify.notifyTxConfirmed(job.credentialId, result.txHash, String(result.tokenId)).catch(() => {});

      this.queue.shift();
      this.logger.log(`Job completed: ${job.credentialId}, txHash: ${result.txHash}`);
    } catch (error) {
      job.attempts++;
      this.logger.error(`Job failed: ${job.credentialId}, attempt: ${job.attempts}, error: ${error.message}`);

      if (job.attempts >= job.maxAttempts) {
        await this.credentialRepository.update(job.credentialId, { status: CredentialStatus.PENDING });
        this.queue.shift();
        this.logger.error(`Job max attempts reached, removing: ${job.credentialId}`);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  getQueueStatus() {
    return {
      length: this.queue.length,
      isProcessing: this.isProcessing,
      jobs: this.queue.map(j => ({
        credentialId: j.credentialId,
        attempts: j.attempts,
      })),
    };
  }
}
