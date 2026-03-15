import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IpfsService } from './ipfs.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [IpfsService],
  exports: [IpfsService],
})
export class IpfsModule {}
