import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import FormData from 'form-data';

export interface IpfsUploadResult {
  cid: string;
  url: string;
}

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly gatewayUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('IPFS_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('IPFS_API_SECRET') || '';
    this.gatewayUrl = 'https://gateway.pinata.cloud';
    
    console.log('[IPFS] API Key loaded:', this.apiKey ? 'YES' : 'NO');
    console.log('[IPFS] API Secret loaded:', this.apiSecret ? 'YES' : 'NO');
  }

  async uploadFile(buffer: Buffer, filename: string): Promise<IpfsUploadResult> {
    if (!this.apiKey || !this.apiSecret) {
      this.logger.warn('IPFS credentials not configured');
      throw new Error('IPFS service not configured');
    }

    try {
      const formData = new FormData();
      formData.append('file', buffer, {
        filename,
        contentType: 'application/pdf'
      });

      this.logger.log(`Uploading ${filename} to IPFS via Pinata...`);

      const response = await this.makeRequest(formData);
      
      const result = JSON.parse(response);
      
      if (!result.IpfsHash) {
        throw new Error('Upload failed - no CID returned');
      }

      const cid = result.IpfsHash;
      
      this.logger.log(`File uploaded to IPFS: ${cid}`);

      return {
        cid,
        url: `${this.gatewayUrl}/ipfs/${cid}`
      };
    } catch (error) {
      this.logger.error(`Failed to upload to IPFS: ${error.message}`);
      throw error;
    }
  }

  private makeRequest(formData: FormData): Promise<string> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.pinata.cloud',
        port: 443,
        path: '/pinning/pinFileToIPFS',
        method: 'POST',
        headers: {
          ...formData.getHeaders(),
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret,
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      
      formData.pipe(req);
    });
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }
}
