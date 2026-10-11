import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum MailProvider {
  RESEND = 'resend',
  SENDGRID = 'sendgrid',
  SMTP = 'smtp',
  MAILGUN = 'mailgun',
}

@Entity('mail_configs')
export class MailConfig extends AbstractEntity {
  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ type: 'enum', enum: MailProvider })
  provider: MailProvider;

  @Column({ name: 'api_key' })
  apiKey: string;

  @Column({ name: 'from_email' })
  fromEmail: string;

  @Column({ name: 'from_name', nullable: true })
  fromName: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>;

  @Index()
  @Column({ name: 'tenant_id', default: 'SYSTEM' })
  tenantId: string;
}
