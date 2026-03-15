import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { CredentialsModule } from './credentials/credentials.module';
import { EventsModule } from './events/events.module';
import { AppController } from './app.controller';
import { MockDatabaseModule } from './common/mock-database.module';
import { SchoolsModule } from './schools/schools.module';
import { RegistrationRequestsModule } from './registration-requests/registration-requests.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { IpfsModule } from './blockchain/ipfs.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MockDatabaseModule,
    BlockchainModule,
    IpfsModule,
    QueueModule,
    AuthModule,
    StudentsModule,
    CredentialsModule,
    EventsModule,
    SchoolsModule,
    RegistrationRequestsModule,],
  controllers: [AppController],
})
export class AppModule { }
