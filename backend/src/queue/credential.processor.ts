import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job, UnrecoverableError } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CredentialRepository } from '../common/repositories/credential.repository';
import { WatcherNotifyService } from '../common/services/watcher-notify.service';
import { CredentialStatus } from '../common/entities/credential.entity';
import { MintCredentialJobData } from './mint-queue.service';

@Processor('credential-mint', {
  concurrency: 5,
})
export class CredentialProcessor extends WorkerHost {
  private readonly logger = new Logger(CredentialProcessor.name);

  constructor(
    private blockchainService: BlockchainService,
    private credentialRepository: CredentialRepository,
    private watcherNotify: WatcherNotifyService,
  ) {
    super();
    this.logger.log('CredentialProcessor initialized');
  }

  async process(job: Job<MintCredentialJobData>): Promise<any> {
    const { credentialId, mintParams } = job.data;

    this.logger.log(`Processing mint job for credential: ${credentialId}`);

    try {
      if (!mintParams?.recipient) {
        throw new Error('Recipient wallet address is empty - cannot mint on blockchain');
      }

      await this.credentialRepository.update(credentialId, { status: CredentialStatus.ISSUED });
      this.watcherNotify.notifyCredentialStatusChanged(credentialId, 'issued').catch(() => {});

      // Call blockchain to mint
      const result = await this.blockchainService.issueDiploma(mintParams);

      // Update credential with txHash and tokenId, set status to "confirmed"
      await this.credentialRepository.update(credentialId, {
        status: CredentialStatus.CONFIRMED,
        txHash: result.txHash,
        tokenId: String(result.tokenId),
        issuedAt: new Date(),
      });

      this.logger.log(`Credential ${credentialId} minted successfully - TokenID: ${result.tokenId}`);

      this.watcherNotify.notifyCredentialStatusChanged(credentialId, 'confirmed').catch(() => {});
      this.watcherNotify
        .notifyTxConfirmed(credentialId, result.txHash, String(result.tokenId))
        .catch(() => {});

      return {
        success: true,
        credentialId,
        txHash: result.txHash,
        tokenId: result.tokenId,
      };
    } catch (error: any) {
      this.logger.error(`Failed to mint credential ${credentialId}: ${error?.message || 'Unknown error'}`);

      const revertName = error?.revert?.name;
      if (
        revertName &&
        ['DuplicateDocument', 'InvalidRecipient', 'InvalidStudentId', 'InvalidDocumentHash'].includes(revertName)
      ) {
        // Deterministic failures: don't waste retries
        throw new UnrecoverableError(`Unrecoverable revert ${revertName}: ${error?.message || ''}`);
      }

      const maxAttempts = job.opts.attempts ?? 1;
      const currentAttempt = job.attemptsMade + 1;
      if (currentAttempt >= maxAttempts) {
        await this.credentialRepository.update(credentialId, { status: CredentialStatus.PENDING });
        this.watcherNotify.notifyCredentialStatusChanged(credentialId, 'pending').catch(() => {});
      }

      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed for credential: ${job.data.credentialId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed for credential: ${job.data.credentialId} - ${error.message}`);
  }
}
