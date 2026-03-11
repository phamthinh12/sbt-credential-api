import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { MockDatabaseService } from '../common/services/mock-database.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [StudentsController],
  providers: [StudentsService, MockDatabaseService],
  exports: [StudentsService],
})
export class StudentsModule {}
