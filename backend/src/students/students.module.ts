import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../common/database.module';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
