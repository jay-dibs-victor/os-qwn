import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { CustomerAccount } from './entities/customer-account.entity';
import { CustomerServiceService } from './customer-service.service';
import { CustomerServiceController } from './customer-service.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/customer-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([CustomerAccount]),
  ],
  controllers: [CustomerServiceController],
  providers: [CustomerServiceService],
})
export class CustomerServiceModule {}
