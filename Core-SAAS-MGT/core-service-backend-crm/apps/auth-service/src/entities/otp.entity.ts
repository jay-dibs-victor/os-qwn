import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum OtpType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
}

@Entity('otps')
export class Otp extends AbstractEntity {
  @Index()
  @Column()
  email: string;

  @Column()
  otpHash: string;

  @Column({ type: 'enum', enum: OtpType })
  type: OtpType;

  @Column()
  @Index()
  tenantId: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @Column({ default: 0 })
  attempts: number;
}
