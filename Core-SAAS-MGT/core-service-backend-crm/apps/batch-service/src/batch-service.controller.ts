import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BatchServiceService } from './batch-service.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { Permissions, PermissionsGuard } from '@app/common';

@ApiTags('batch')
@Controller('batch')
@UseGuards(PermissionsGuard)
export class BatchServiceController {
  constructor(private readonly batchServiceService: BatchServiceService) {}

  @Post()
  @Permissions('batch.create')
  @ApiOperation({ summary: 'Create a new batch job' })
  @ApiResponse({ status: 201, description: 'Batch job created successfully' })
  async create(@Body() dto: CreateBatchDto) {
    return this.batchServiceService.createBatch(dto);
  }

  @Get(':id')
  @Permissions('batch.view')
  @ApiOperation({ summary: 'Get batch job status and items' })
  @ApiParam({ name: 'id', required: true, description: 'Batch job ID' })
  @ApiResponse({ status: 200, description: 'Batch job details returned' })
  async getBatch(@Param('id') id: string) {
    return this.batchServiceService.getBatch(id);
  }

  @Post(':id/execute')
  @Permissions('batch.execute')
  @ApiOperation({ summary: 'Start processing a batch job' })
  @ApiParam({ name: 'id', required: true, description: 'Batch job ID' })
  @ApiResponse({ status: 200, description: 'Batch execution started' })
  async executeBatch(@Param('id') id: string) {
    return this.batchServiceService.executeBatch(id);
  }

  @Post(':id/retry')
  @Permissions('batch.retry')
  @ApiOperation({ summary: 'Retry failed items in a batch job' })
  @ApiParam({ name: 'id', required: true, description: 'Batch job ID' })
  @ApiResponse({ status: 200, description: 'Batch retry initiated' })
  async retryBatch(@Param('id') id: string) {
    return this.batchServiceService.retryBatch(id);
  }
}
