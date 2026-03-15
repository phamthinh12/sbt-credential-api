import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract, TransactionResponse, zeroPadValue, toUtf8Bytes } from 'ethers';
import * as DiplomaRegistryABI from './abis/DiplomaRegistry.json';

const CONTRACT_ABI = (DiplomaRegistryABI as any).default || DiplomaRegistryABI;

export interface MintDiplomaParams {
  recipient: string;
  studentId: string;
  studentName: string;
  degreeTitle: string;
  ipfsCID: string;
  documentHash: string;
  graduationYear: number;
  remarks?: string;
}

export interface MintResult {
  txHash: string;
  tokenId: number;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: Contract;
  private isInitialized: boolean = false;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    try {
      const rpcUrl = this.configService.get<string>('POLYGON_RPC_URL');
      const privateKey = this.configService.get<string>('PRIVATE_KEY');
      const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

      if (!rpcUrl || !contractAddress) {
        this.logger.warn('Blockchain service not configured - RPC_URL or CONTRACT_ADDRESS missing');
        return;
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      if (privateKey && privateKey !== 'your_private_key_here') {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contract = new Contract(contractAddress, CONTRACT_ABI, this.wallet);
      } else {
        this.logger.warn('PRIVATE_KEY not configured - using provider only (read-only mode)');
        this.contract = new Contract(contractAddress, CONTRACT_ABI, this.provider);
      }

      this.isInitialized = true;
      this.logger.log(`Blockchain service initialized with contract: ${contractAddress}`);
    } catch (error) {
      this.logger.error('Failed to initialize blockchain service', error);
    }
  }

  async issueDiploma(params: MintDiplomaParams): Promise<MintResult> {
    if (!this.isInitialized || !this.wallet) {
      throw new Error('Blockchain service not initialized or wallet not configured');
    }

    try {
      this.logger.log(`Issuing diploma for student: ${params.studentId}`);

      const docHashHex = params.documentHash.startsWith('0x') 
        ? params.documentHash 
        : '0x' + params.documentHash;
      const docHashBytes = ethers.getBytes(docHashHex);

      const tx: TransactionResponse = await this.contract.issueDiploma(
        params.recipient,
        params.studentId,
        params.studentName,
        params.degreeTitle,
        params.ipfsCID || '',
        docHashBytes,
        params.graduationYear,
        params.remarks || ''
      );

      this.logger.log(`Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait();

      const tokenId = this.extractTokenIdFromReceipt(receipt);
      
      this.logger.log(`Diploma issued successfully - TokenID: ${tokenId}, TX: ${tx.hash}`);

      return {
        txHash: tx.hash,
        tokenId: tokenId,
      };
    } catch (error) {
      this.logger.error(`Failed to issue diploma: ${error.message}`);
      throw error;
    }
  }

  async revokeDiploma(tokenId: number, reason: string): Promise<string> {
    if (!this.isInitialized || !this.wallet) {
      throw new Error('Blockchain service not initialized or wallet not configured');
    }

    try {
      this.logger.log(`Revoking diploma with tokenId: ${tokenId}`);

      const tx: TransactionResponse = await this.contract.revokeDiploma(tokenId, reason);
      await tx.wait();

      this.logger.log(`Diploma revoked successfully - TX: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to revoke diploma: ${error.message}`);
      throw error;
    }
  }

  async getDiploma(tokenId: number): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      return await this.contract.getDiploma(tokenId);
    } catch (error) {
      this.logger.error(`Failed to get diploma: ${error.message}`);
      throw error;
    }
  }

  async getStudentDiplomas(studentId: string): Promise<number[]> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      return await this.contract.getStudentDiplomas(studentId);
    } catch (error) {
      this.logger.error(`Failed to get student diplomas: ${error.message}`);
      throw error;
    }
  }

  async getWalletDiplomas(walletAddress: string): Promise<number[]> {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      return await this.contract.getWalletDiplomas(walletAddress);
    } catch (error) {
      this.logger.error(`Failed to get wallet diplomas: ${error.message}`);
      throw error;
    }
  }

  private extractTokenIdFromReceipt(receipt: any): number {
    const issueEvent = receipt.logs.find((log: any) => {
      try {
        return this.contract.interface.parseLog(log)?.name === 'DiplomaIssued';
      } catch {
        return false;
      }
    });

    if (issueEvent) {
      const parsed = this.contract.interface.parseLog(issueEvent);
      return parsed.args.tokenId.toNumber();
    }

    throw new Error('Could not extract tokenId from transaction receipt');
  }

  isReady(): boolean {
    return this.isInitialized && !!this.wallet;
  }
}
