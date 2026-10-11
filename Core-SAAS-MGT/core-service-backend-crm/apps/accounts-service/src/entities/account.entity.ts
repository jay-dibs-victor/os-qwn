import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum AccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  TERM_DEPOSIT = 'TERM_DEPOSIT',
}

export enum AccountStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PND = 'PND', // Post No Debit
  PNC = 'PNC', // Post No Credit
  DORMANT = 'DORMANT',
  CLOSED = 'CLOSED',
}

export enum KycTier {
  TIER_0 = 'TIER_0', // Unverified
  TIER_1 = 'TIER_1', // Phone + BVN
  TIER_2 = 'TIER_2', // ID Document
  TIER_3 = 'TIER_3', // Full Address + Biometric
}

@Entity('accounts')
export class Account extends AbstractEntity {
  @Column({ unique: true, length: 10 })
  @Index()
  accountNumber: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: AccountType })
  type: AccountType;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.DRAFT })
  status: AccountStatus;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'enum', enum: KycTier, default: KycTier.TIER_0 })
  kycTier: KycTier;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  availableBalance: number;

  @Column()
  @Index()
  customerId: string;

  @Column()
  @Index()
  tenantId: string;

  @Column({ nullable: true })
  glAccountId?: string; // Linked control GL account
}
