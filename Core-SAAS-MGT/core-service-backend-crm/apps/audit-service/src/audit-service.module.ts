import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { AuditServiceService } from './audit-service.service';
import { AuditHashService } from './audit-hash.service';
import { AuditExportService } from './audit-export.service';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/audit-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([AuditLog]),
  ],
  controllers: [],
  providers: [AuditServiceService, AuditHashService, AuditExportService],
})
export class AuditServiceModule {}
