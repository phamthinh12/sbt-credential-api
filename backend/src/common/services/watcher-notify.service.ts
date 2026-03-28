import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WatcherNotifyService {
  private readonly logger = new Logger(WatcherNotifyService.name);
  private readonly watcherUrl: string;

  constructor(private configService: ConfigService) {
    this.watcherUrl = this.configService.get<string>('WATCHER_URL', 'http://localhost:3002');
  }

  private async post(path: string, body: any): Promise<void> {
    try {
      const res = await fetch(`${this.watcherUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        this.logger.log(`Broadcast ${path} success`);
      } else {
        this.logger.warn(`Broadcast ${path} failed: ${res.status}`);
      }
    } catch (err: any) {
      this.logger.warn(`Broadcast ${path} error: ${err.message}`);
    }
  }

  async notifyCredentialIssued(data: {
    studentId: string;
    credentialId: string;
    name?: string;
    status?: string;
  }) {
    await this.post('/broadcast/credential-issued', data);
  }

  async notifyCredentialStatusChanged(credentialId: string, status: string) {
    await this.post('/broadcast/credential-status-changed', { credentialId, status });
  }

  async notifyTxConfirmed(credentialId: string, txHash: string, tokenId: string) {
    await this.post('/broadcast/tx-confirmed', { credentialId, txHash, tokenId });
  }

  async notifyRegistrationUpdated(data: {
    requestId: string;
    type: string;
    name: string;
    status: string;
  }) {
    await this.post('/broadcast/registration-updated', data);
  }
}
