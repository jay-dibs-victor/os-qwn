import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum CustomerType {
  DRIVER = 'driver',
  RIDER = 'rider',
  PARTNER = 'partner',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('customers')
@Index(['tenantId', 'email'], { unique: true })
@Index(['tenantId', 'phone'], { unique: true })
@Index(['tenantId', 'customerType'])
@Index(['tenantId', 'status'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  customerId?: string;

  @Column({ type: 'varchar', length: 255 })
  tenantId: string;

  @Column({ type: 'enum', enum: CustomerType })
  customerType: CustomerType;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profilePicture?: string;

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.PENDING_VERIFICATION })
  status: CustomerStatus;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  // Driver-specific fields
  @Column({ type: 'varchar', length: 50, nullable: true })
  licenseNumber?: string;

  @Column({ type: 'date', nullable: true })
  licenseExpiry?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vehicleRegistration?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vehicleModel?: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rating?: number;

  @Column({ type: 'integer', default: 0 })
  totalRides: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalEarnings: number;

  // Rider-specific fields
  @Column({ type: 'integer', default: 0 })
  totalTrips: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSpent: number;

  // External bank account info (for payouts)
  @Column({ type: 'varchar', length: 255, nullable: true })
  bankName?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  bankCode?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bankAccountNumber?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankAccountName?: string;

  // Partner-specific fields
  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taxId?: string;

  @Column({ type: 'text', nullable: true })
  businessDescription?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
