import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RemittanceSchedule {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum PayoutStrategy {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE_SPLIT = 'percentage_split',
}

@Entity('fleet_contracts')
@Index('idx_fc_driver', ['tenantId', 'driverId'])
@Index('idx_fc_partner', ['tenantId', 'partnerId'])
export class FleetContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tenantId: string;

  @Column()
  partnerId: string;

  @Column()
  driverId: string;

  @Column({ nullable: true })
  vehicleId?: string;

  @Column({ type: 'varchar', length: 20 })
  remittanceSchedule: RemittanceSchedule;

  @Column({ type: 'varchar', length: 20 })
  payoutStrategy: PayoutStrategy;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rateValue: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
