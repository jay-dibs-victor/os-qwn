import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum DriverDebtStatus {
  ACTIVE = 'ACTIVE',
  RESTRICTED = 'RESTRICTED',
  SETTLED = 'SETTLED',
  WAIVED = 'WAIVED',
}

@Entity('driver_debts')
@Index(['tenantId', 'driverCustomerId'], { unique: true })
@Index(['tenantId', 'status'])
export class DriverDebt extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column()
  driverCustomerId: string;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalDebt: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  outstandingBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  totalSettled: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 5000 })
  debtThreshold: number;

  @Column({
    type: 'enum',
    enum: DriverDebtStatus,
    default: DriverDebtStatus.ACTIVE,
  })
  status: DriverDebtStatus;

  @Column({ nullable: true })
  lastRestrictedAt?: Date;

  @Column({ nullable: true })
  restrictedReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
