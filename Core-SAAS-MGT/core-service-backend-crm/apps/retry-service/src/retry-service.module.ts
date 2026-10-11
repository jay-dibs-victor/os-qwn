import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { RetryServiceService } from './retry-service.service';
import { RetryEventsPublisher } from './retry-events.publisher';
import { SagaCompensationService } from './saga-compensation.service';
import { RetryRecord } from './entities/retry-record.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([RetryRecord]),
  ],
  controllers: [],
  providers: [
    RetryServiceService,
    RetryEventsPublisher,
    SagaCompensationService,
  ],
  exports: [RetryServiceService],
})
export class RetryServiceModule {}
