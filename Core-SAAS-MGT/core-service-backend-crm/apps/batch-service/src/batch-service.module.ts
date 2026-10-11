import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchServiceController } from './batch-service.controller';
import { BatchServiceService } from './batch-service.service';
import { BatchProcessorService } from './batch-processor.service';
import { DatabaseModule } from '@app/common';
import { BatchJob } from './entities/batch-job.entity';
import { BatchItem } from './entities/batch-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/batch-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([BatchJob, BatchItem]),
  ],
  controllers: [BatchServiceController],
  providers: [BatchServiceService, BatchProcessorService],
})
export class BatchServiceModule {}
