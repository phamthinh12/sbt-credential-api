import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CredentialProcessor } from './credential.processor';
import { QueueController } from './queue.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        
        if (redisUrl) {
          return {
            connection: {
              url: redisUrl,
              maxRetriesPerRequest: 1,
              connectTimeout: 5000,
              commandTimeout: 5000,
            },
          };
        }
        
        return {
          connection: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: parseInt(configService.get('REDIS_PORT') || '6379'),
            password: configService.get('REDIS_PASSWORD') || undefined,
            maxRetriesPerRequest: 1,
            connectTimeout: 5000,
            commandTimeout: 5000,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'credential-mint',
    }),
    BlockchainModule,
    AuthModule,
  ],
  controllers: [QueueController],
  providers: [CredentialProcessor],
  exports: [BullModule],
})
export class QueueModule {}
