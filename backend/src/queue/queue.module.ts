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
        const redisHost = configService.get('REDIS_HOST');
        
        if (redisUrl) {
          const isUpstash = redisUrl.includes('upstash');
          if (isUpstash) {
            const url = new URL(redisUrl.replace('redis://', 'rediss://'));
            const password = url.password;
            url.password = '';
            return {
              connection: {
                host: url.hostname,
                port: 6380,
                password: password,
                tls: {},
                lazyConnect: true,
              },
            };
          }
          return {
            connection: {
              url: redisUrl.replace('redis://', 'rediss://'),
              tls: {},
              lazyConnect: true,
            },
          };
        }
        
        if (redisHost?.includes('upstash')) {
          const password = configService.get('REDIS_PASSWORD');
          return {
            connection: {
              host: redisHost,
              port: 6380,
              password: password,
              tls: {},
              lazyConnect: true,
            },
          };
        }
        
        return {
          connection: {
            host: configService.get('REDIS_HOST') || 'localhost',
            port: parseInt(configService.get('REDIS_PORT') || '6379'),
            password: configService.get('REDIS_PASSWORD') || undefined,
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
