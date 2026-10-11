import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TripStatus {
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in_progress',
}

@Entity('trips')
@Index(['tenantId', 'completedAt'])
@Index(['tenantId', 'driverCustomerId'])
@Index(['tenantId', 'riderCustomerId'])
@Index(['tenantId', 'status'])
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  tenantId: string;

  /** FK to customers.id (driver) */
  @Column({ type: 'uuid' })
  driverCustomerId: string;

  /** FK to customers.id (rider) */
  @Column({ type: 'uuid' })
  riderCustomerId: string;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.COMPLETED })
  status: TripStatus;

  /** Total fare charged to rider */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  fareAmount: number;

  /** Platform commission (e.g. 10% of fare) */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  commissionAmount: number;

  /** Commission rate applied (stored for audit) */
  @Column({ type: 'decimal', precision: 5, scale: 4 })
  commissionRate: number;

  /** Net payout to driver after commission */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  driverPayout: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pickupLocation?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dropoffLocation?: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  distanceKm?: number;

  @Column({ type: 'integer', nullable: true })
  durationMinutes?: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
