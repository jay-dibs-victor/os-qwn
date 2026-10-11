import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { KycServiceController } from './kyc-service.controller';
import { KycServiceService } from './kyc-service.service';
import { KycEventsPublisher } from './kyc-events.publisher';
import { KycVerificationProvider } from './kyc-verification.provider';
import { KycRecord } from './entities/kyc-record.entity';
import { KycDocument } from './entities/kyc-document.entity';
import { DatabaseSeeder } from './database.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/kyc-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([KycRecord, KycDocument]),
  ],
  controllers: [KycServiceController],
  providers: [KycServiceService, KycEventsPublisher, KycVerificationProvider, DatabaseSeeder],
})
export class KycServiceModule {}
