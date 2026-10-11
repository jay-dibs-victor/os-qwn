import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum TripFinancialStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  REVENUE_POSTED = 'REVENUE_POSTED',
  DRIVER_CREDITED = 'DRIVER_CREDITED',
  PARTNER_SETTLED = 'PARTNER_SETTLED',
  COMPLETED = 'COMPLETED',
  REVERSED = 'REVERSED',
}

@Entity('trip_financial_records')
@Index(['tripId', 'tenantId'])
@Index(['tenantId', 'driverCustomerId'])
@Index(['tenantId', 'riderCustomerId'])
@Index(['tenantId', 'status'])
export class TripFinancialRecord extends AbstractEntity {
  @Column()
  @Index()
  tripId: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  driverCustomerId: string;

  @Column()
  riderCustomerId: string;

  @Column({ nullable: true })
  partnerTenantId?: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  totalFare: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  platformCommissionAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0.10 })
  platformCommissionRate: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  partnerCommissionAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  partnerCommissionRate: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  gatewayFee: number;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  driverPayout: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({
    type: 'enum',
    enum: TripFinancialStatus,
    default: TripFinancialStatus.PENDING_PAYMENT,
  })
  status: TripFinancialStatus;

  @Column({ nullable: true })
  paystackReference?: string;

  @Column({ nullable: true })
  paymentJournalId?: string;

  @Column({ nullable: true })
  revenueJournalId?: string;

  @Column({ nullable: true })
  driverCreditJournalId?: string;

  @Column({ nullable: true })
  partnerSettlementJournalId?: string;

  @Column({ type: 'jsonb', nullable: true })
  auditTrail?: Array<{
    event: string;
    timestamp: string;
    actor: string;
    details: Record<string, any>;
  }>;

  @Column({ type: 'boolean', default: false })
  isCorporateDriver: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
