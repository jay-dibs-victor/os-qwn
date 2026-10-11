import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailConfig, MailProvider } from './entities/mail-config.entity';

@Injectable()
export class MailConfigSeeder implements OnModuleInit {
  private readonly logger = new Logger(MailConfigSeeder.name);

  constructor(
    @InjectRepository(MailConfig)
    private readonly mailConfigRepository: Repository<MailConfig>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async seedDefaults() {
    const count = await this.mailConfigRepository.count();
    if (count > 0) {
      this.logger.log('Mail configs already seeded, skipping');
      return;
    }

    this.logger.log('Seeding default mail configs...');

    const defaults = [
      {
        name: 'Resend',
        provider: MailProvider.RESEND,
        apiKey: process.env.RESEND_API_KEY || 're_placeholder',
        fromEmail: process.env.MAIL_FROM_EMAIL || 'noreply@queensos.com',
        fromName: process.env.MAIL_FROM_NAME || 'Queens OS',
        isDefault: true,
        isActive: true,
        tenantId: 'SYSTEM',
        config: {
          apiUrl: 'https://api.resend.com',
        },
      },
      {
        name: 'SendGrid',
        provider: MailProvider.SENDGRID,
        apiKey: process.env.SENDGRID_API_KEY || 'SG_placeholder',
        fromEmail: process.env.MAIL_FROM_EMAIL || 'noreply@queensos.com',
        fromName: process.env.MAIL_FROM_NAME || 'Queens OS',
        isDefault: false,
        isActive: false,
        tenantId: 'SYSTEM',
        config: {
          apiUrl: 'https://api.sendgrid.com/v3',
        },
      },
    ];

    for (const config of defaults) {
      await this.mailConfigRepository.save(
        this.mailConfigRepository.create(config),
      );
      this.logger.log(`  Seeded "${config.name}" mail config (default: ${config.isDefault})`);
    }

    this.logger.log('Mail config seeding complete');
  }
}
