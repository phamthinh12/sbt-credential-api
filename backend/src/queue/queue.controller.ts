import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('queue')
@Controller('queue')
export class QueueController {
  constructor(
    @InjectQueue('credential-mint') private mintQueue: Queue,
  ) {}

  @Get('jobs/:credentialId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'school_admin')
  @ApiOperation({ summary: 'Kiểm tra job status của credential' })
  async getJobStatus(@Param('credentialId') credentialId: string) {
    const jobs = await this.mintQueue.getJobs();
    
    const relevantJob = jobs.find(job => job.data.credentialId === credentialId);
    
    if (!relevantJob) {
      return { 
        credentialId, 
        status: 'not_found',
        message: 'Job không tồn tại hoặc đã hoàn thành' 
      };
    }

    return {
      credentialId,
      jobId: relevantJob.id,
      status: relevantJob.isCompleted() ? 'completed' : 
             relevantJob.isFailed() ? 'failed' : 
             relevantJob.isActive() ? 'active' : 'waiting',
      attempts: relevantJob.attemptsMade,
      failedReason: relevantJob.failedReason,
      processedOn: relevantJob.processedOn,
      finishedOn: relevantJob.finishedOn,
    };
  }

  @Get('failed-jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiOperation({ summary: 'Lấy danh sách job thất bại' })
  async getFailedJobs() {
    const jobs = await this.mintQueue.getFailed();
    
    return {
      count: jobs.length,
      jobs: jobs.map(job => ({
        id: job.id,
        credentialId: job.data.credentialId,
        failedReason: job.failedReason,
        failedAt: job.failedReason ? new Date() : null,
      }))
    };
  }
}
