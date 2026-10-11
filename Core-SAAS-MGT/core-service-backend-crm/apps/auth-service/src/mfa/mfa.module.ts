import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MfaBackupCode } from '../entities/mfa-backup-code.entity';
import { User } from '../entities/user.entity';
import { MfaService } from './mfa.service';
import { MfaController } from './mfa.controller';
import { SMS_PROVIDER, StubSmsProvider } from './sms.provider';
import { UsersRepository } from '../users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MfaBackupCode, User])],
  providers: [
    MfaService,
    UsersRepository,
    { provide: SMS_PROVIDER, useClass: StubSmsProvider },
  ],
  controllers: [MfaController],
  exports: [MfaService],
})
export class MfaModule {}
