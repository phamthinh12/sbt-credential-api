import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { DatabaseModule } from '../common/database.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
