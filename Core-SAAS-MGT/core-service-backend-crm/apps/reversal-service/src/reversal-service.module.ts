import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReversalServiceController } from './reversal-service.controller';
import { ReversalServiceService } from './reversal-service.service';
import { DatabaseModule } from '@app/common';
import { ReversalRecord } from './entities/reversal-record.entity';
import { ReversalEventsPublisher } from './reversal-events.publisher';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/reversal-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([ReversalRecord]),
  ],
  controllers: [ReversalServiceController],
  providers: [ReversalServiceService, ReversalEventsPublisher],
})
export class ReversalServiceModule {}
