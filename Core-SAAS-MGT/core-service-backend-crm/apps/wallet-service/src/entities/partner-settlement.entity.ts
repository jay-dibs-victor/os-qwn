import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum PartnerSettlementStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export enum PartnerSettlementType {
  COMMISSION = 'COMMISSION',
  SUBSCRIPTION = 'SUBSCRIPTION',
  REMITTANCE = 'REMITTANCE',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('partner_settlements')
@Index(['tenantId', 'partnerId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'dueDate'])
export class PartnerSettlement extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column()
  partnerId: string;

  @Column({ type: 'enum', enum: PartnerSettlementType, default: PartnerSettlementType.COMMISSION })
  settlementType: PartnerSettlementType;

  @Column({ type: 'enum', enum: PartnerSettlementStatus, default: PartnerSettlementStatus.PENDING })
  status: PartnerSettlementStatus;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  settledAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ nullable: true })
  @Index()
  reference?: string;

  @Column({ nullable: true })
  journalEntryId?: string;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail?: Array<{
    event: string;
    timestamp: string;
    actor: string;
    details: Record<string, any>;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
