import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { BlockchainService, MintDiplomaParams } from '../blockchain/blockchain.service';
import { MockDatabaseService } from '../common/services/mock-database.service';

export interface MintCredentialJobData {
  credentialId: string;
  studentId: string;
  studentName: string;
  degreeTitle: string;
  recipientWallet: string;
  ipfsCID?: string;
  documentHash: string;
  graduationYear: number;
  schoolId: string;
  remarks?: string;
}

@Processor('credential-mint', {
  concurrency: 5,
})
export class CredentialProcessor extends WorkerHost {
  private readonly logger = new Logger(CredentialProcessor.name);

  constructor(
    private blockchainService: BlockchainService,
    private mockDb: MockDatabaseService,
  ) {
    super();
    this.logger.log('CredentialProcessor initialized');
  }

  async process(job: Job<MintCredentialJobData>): Promise<any> {
    const { 
      credentialId, 
      studentId, 
      studentName, 
      degreeTitle, 
      recipientWallet,
      ipfsCID,
      documentHash, 
      graduationYear,
      remarks 
    } = job.data;

    this.logger.log(`Processing mint job for credential: ${credentialId}`);

    try {
      // Update status to "issued" - token is being minted
      this.mockDb.updateCredential(credentialId, { status: 'issued' as any });

      // Call blockchain to mint
      const result = await this.blockchainService.issueDiploma({
        recipient: recipientWallet,
        studentId: studentId,
        studentName: studentName,
        degreeTitle: degreeTitle,
        ipfsCID: ipfsCID || '',
        documentHash: documentHash,
        graduationYear: graduationYear,
        remarks: remarks || '',
      });

      // Update credential with txHash and tokenId, set status to "confirmed"
      this.mockDb.updateCredential(credentialId, {
        status: 'confirmed' as any,
        txHash: result.txHash,
        tokenId: String(result.tokenId),
        issuedAt: new Date(),
      });

      this.logger.log(`Credential ${credentialId} minted successfully - TokenID: ${result.tokenId}`);

      return {
        success: true,
        credentialId,
        txHash: result.txHash,
        tokenId: result.tokenId,
      };
    } catch (error) {
      this.logger.error(`Failed to mint credential ${credentialId}: ${error.message}`);
      
      // Update status to indicate failure
      this.mockDb.updateCredential(credentialId, { 
        status: 'pending' as any,
        // Store error info for debugging
      });

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
