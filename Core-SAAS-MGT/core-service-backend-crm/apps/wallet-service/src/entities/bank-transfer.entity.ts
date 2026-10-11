import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum BankTransferStatus {
  AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',
  DRIVER_CONFIRMED = 'DRIVER_CONFIRMED',
  RIDER_CONFIRMED = 'RIDER_CONFIRMED',
  CONFIRMED = 'CONFIRMED',
  MISMATCH = 'MISMATCH',
  DISPUTED = 'DISPUTED',
}

@Entity('bank_transfers')
@Index(['tenantId', 'tripId'])
@Index(['tenantId', 'status'])
export class BankTransfer extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column()
  tripId: string;

  @Column()
  driverCustomerId: string;

  @Column()
  riderCustomerId: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'NGN' })
  currency: string;

  @Column({
    type: 'enum',
    enum: BankTransferStatus,
    default: BankTransferStatus.AWAITING_CONFIRMATION,
  })
  status: BankTransferStatus;

  @Column({ nullable: true })
  driverConfirmedAmount?: number;

  @Column({ nullable: true })
  riderConfirmedAmount?: number;

  @Column({ nullable: true })
  driverConfirmedAt?: Date;

  @Column({ nullable: true })
  riderConfirmedAt?: Date;

  @Column({ nullable: true })
  driverNote?: string;

  @Column({ nullable: true })
  riderNote?: string;

  @Column({ unique: true })
  reference: string;

  @Column({ nullable: true })
  journalEntryId?: string;

  @Column({ nullable: true })
  disputeId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
