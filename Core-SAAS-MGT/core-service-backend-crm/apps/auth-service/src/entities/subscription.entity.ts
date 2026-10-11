import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SubscriptionType {
  DRIVER_MONTHLY = 'driver_monthly',
  DRIVER_ANNUAL = 'driver_annual',
  PARTNER_MONTHLY = 'partner_monthly',
  PARTNER_ANNUAL = 'partner_annual',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('subscriptions')
@Index(['tenantId', 'billedAt'])
@Index(['tenantId', 'customerCustomerId'])
@Index(['tenantId', 'subscriptionType'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  tenantId: string;

  /** FK to customers.id */
  @Column({ type: 'uuid' })
  customerCustomerId: string;

  @Column({ type: 'enum', enum: SubscriptionType })
  subscriptionType: SubscriptionType;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  /** Amount charged for this billing cycle */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  /** Currency */
  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  /** Billing period start */
  @Column({ type: 'timestamp with time zone' })
  periodStart: Date;

  /** Billing period end */
  @Column({ type: 'timestamp with time zone' })
  periodEnd: Date;

  /** When the charge was collected */
  @Column({ type: 'timestamp with time zone' })
  billedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
