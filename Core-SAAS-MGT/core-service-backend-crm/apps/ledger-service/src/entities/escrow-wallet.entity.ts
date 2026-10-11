import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum EscrowWalletStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  RELEASED = 'RELEASED',
  FROZEN = 'FROZEN',
}

export enum EscrowCycleType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

@Entity('escrow_wallets')
@Index(['tenantId', 'partnerId'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'cycleType', 'cycleEndDate'])
export class EscrowWallet extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column()
  partnerId: string;

  @Column({ type: 'enum', enum: EscrowWalletStatus, default: EscrowWalletStatus.ACTIVE })
  status: EscrowWalletStatus;

  @Column({ type: 'enum', enum: EscrowCycleType, default: EscrowCycleType.DAILY })
  cycleType: EscrowCycleType;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  lockedBalance: number;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  releasedBalance: number;

  @Column({ type: 'timestamp', nullable: true })
  cycleStartDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cycleEndDate?: Date;

  @Column({ nullable: true })
  reference?: string;

  @Column({ type: 'jsonb', nullable: true })
  cycleHistory?: Array<{
    cycleStart: string;
    cycleEnd: string;
    amountLocked: number;
    amountReleased: number;
    status: string;
  }>;

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
