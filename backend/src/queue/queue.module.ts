import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CredentialProcessor } from './credential.processor';
import { QueueController } from './queue.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../common/database.module';
import { MintQueueService } from './mint-queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = parseInt(configService.get<string>('REDIS_PORT') || '6379', 10);
        const redisPassword = configService.get<string>('REDIS_PASSWORD') || undefined;
        const redisUsername = configService.get<string>('REDIS_USERNAME') || undefined;

        if (redisUrl) {
          const normalizedUrl = redisUrl.startsWith('rediss://')
            ? redisUrl
            : redisUrl.replace(/^redis:\/\//, 'rediss://');

          const url = new URL(normalizedUrl);
          const port = url.port ? parseInt(url.port, 10) : 6379;

          return {
            connection: {
              host: url.hostname,
              port,
              username: url.username || undefined,
              password: url.password || undefined,
              tls: url.protocol === 'rediss:' ? {} : undefined,
              lazyConnect: true,
            },
          };
        }

        const isLikelyTls = redisHost?.includes('upstash') || redisHost?.includes('tls');

        return {
          connection: {
            host: redisHost || 'localhost',
            port: redisPort,
            username: redisUsername,
            password: redisPassword,
            tls: isLikelyTls ? {} : undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'credential-mint',
    }),
    BlockchainModule,
    DatabaseModule,
    AuthModule,
  ],
  controllers: [QueueController],
  providers: [CredentialProcessor, MintQueueService],
  exports: [BullModule, MintQueueService],
})
export class QueueModule {}
