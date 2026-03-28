import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CredentialRepository } from '../common/repositories/credential.repository';
import { EventsGateway } from '../events/events.gateway';
import { CredentialStatus } from '../common/entities/credential.entity';

@Controller('watcher')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private credentialRepository: CredentialRepository,
    private eventsGateway: EventsGateway,
  ) {}

  @Post('credential-confirmed')
  async handleCredentialConfirmed(
    @Body() body: { txHash: string; tokenId: string; studentId: string; documentHash: string },
  ) {
    this.logger.log(`Received credential-confirmed: tokenId=${body.tokenId}, txHash=${body.txHash}`);

    const credentials = await this.credentialRepository.findAll();
    const credential = credentials.find(
      (c) => c.fileHash === body.documentHash || c.txHash === body.txHash,
    );

    if (credential) {
      await this.credentialRepository.update(credential.id, {
        status: CredentialStatus.CONFIRMED,
        txHash: body.txHash,
        tokenId: body.tokenId,
        issuedAt: new Date(),
      });

      this.eventsGateway.emitTxConfirmed(credential.id, body.txHash, body.tokenId);
      this.eventsGateway.emitCredentialStatusChanged(credential.id, 'confirmed');

      if (credential.studentId) {
        this.eventsGateway.emitCredentialIssued(credential.studentId, {
          credentialId: credential.id,
          txHash: body.txHash,
          tokenId: body.tokenId,
          status: 'confirmed',
        });
      }

      return { success: true, credentialId: credential.id };
    }

    this.logger.warn(`No matching credential found for documentHash=${body.documentHash}`);
    return { success: false, message: 'No matching credential found' };
  }

  @Post('credential-revoked')
  async handleCredentialRevoked(
    @Body() body: { txHash: string; tokenId: string; reason: string; revokedBy: string },
  ) {
    this.logger.log(`Received credential-revoked: tokenId=${body.tokenId}`);

    const credentials = await this.credentialRepository.findAll();
    const credential = credentials.find((c) => c.tokenId === body.tokenId);

    if (credential) {
      await this.credentialRepository.update(credential.id, {
        status: CredentialStatus.REVOKED,
      });

      this.eventsGateway.emitCredentialStatusChanged(credential.id, 'revoked');
      return { success: true, credentialId: credential.id };
    }

    return { success: false, message: 'No matching credential found' };
  }

  @Post('credential-suspended')
  async handleCredentialSuspended(
    @Body() body: { txHash: string; tokenId: string; reason: string; suspendedBy: string },
  ) {
    this.logger.log(`Received credential-suspended: tokenId=${body.tokenId}`);

    const credentials = await this.credentialRepository.findAll();
    const credential = credentials.find((c) => c.tokenId === body.tokenId);

    if (credential) {
      this.eventsGateway.emitCredentialStatusChanged(credential.id, 'suspended');
      return { success: true, credentialId: credential.id };
    }

    return { success: false, message: 'No matching credential found' };
  }

  @Post('credential-reinstated')
  async handleCredentialReinstated(
    @Body() body: { txHash: string; tokenId: string; reinstatedBy: string },
  ) {
    this.logger.log(`Received credential-reinstated: tokenId=${body.tokenId}`);

    const credentials = await this.credentialRepository.findAll();
    const credential = credentials.find((c) => c.tokenId === body.tokenId);

    if (credential) {
      await this.credentialRepository.update(credential.id, {
        status: CredentialStatus.CONFIRMED,
      });

      this.eventsGateway.emitCredentialStatusChanged(credential.id, 'confirmed');
      return { success: true, credentialId: credential.id };
    }

    return { success: false, message: 'No matching credential found' };
  }
}
