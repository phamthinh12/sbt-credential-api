import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MintDiplomaParams } from '../blockchain/blockchain.service';

export interface MintCredentialJobData {
  credentialId: string;
  mintParams: MintDiplomaParams;
}

@Injectable()
export class MintQueueService {
  private readonly logger = new Logger(MintQueueService.name);

  constructor(
    @InjectQueue('credential-mint') private readonly mintQueue: Queue<MintCredentialJobData>,
  ) {}

  async addMintJob(credentialId: string, mintParams: MintDiplomaParams) {
    await this.mintQueue.add(
      'mint-credential',
      { credentialId, mintParams },
      {
        jobId: credentialId,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`Queued mint job: ${credentialId}`);
  }
}

