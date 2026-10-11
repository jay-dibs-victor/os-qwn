import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { MailConfig } from './entities/mail-config.entity';
import { MailConfigSeeder } from './mail-config.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/notification-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([MailConfig]),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService, MailConfigSeeder],
})
export class NotificationServiceModule {}
