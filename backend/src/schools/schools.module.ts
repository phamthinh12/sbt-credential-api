import { Module } from '@nestjs/common';
import { SchoolsController } from './schools.controller';
import { SchoolsService } from './schools.service';
import { MockDatabaseService } from '../common/services/mock-database.service';

@Module({
    controllers: [SchoolsController],
    providers: [SchoolsService, MockDatabaseService],
    exports: [SchoolsService], // Export để các module khác (như Registration) có thể dùng
})
export class SchoolsModule { }