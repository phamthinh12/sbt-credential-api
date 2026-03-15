import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as http from 'http';

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
      const formData = this.buildFormData(buffer, filename);

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

  private buildFormData(buffer: Buffer, filename: string): string {
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
    
    const parts = [];
    
    parts.push(`--${boundary}\r\n`);
    parts.push(`Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`);
    parts.push('Content-Type: application/pdf\r\n\r\n');
    parts.push(buffer.toString('binary'));
    parts.push(`\r\n--${boundary}--\r\n`);

    return parts.join('');
  }

  private makeRequest(body: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
      const parsedUrl = new URL(url);
      
      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data; boundary=----FormBoundary' + Math.random().toString(36).substring(2),
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
      
      req.write(body);
      req.end();
    });
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }
}
