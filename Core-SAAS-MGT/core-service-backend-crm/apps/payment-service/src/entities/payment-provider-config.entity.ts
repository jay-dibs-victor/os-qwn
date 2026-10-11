import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ProviderType {
  PAYSTACK = 'paystack',
  STRIPE = 'stripe',
  NIBBS = 'nibbs',
  FLUTTERWAVE = 'flutterwave',
}

@Entity('payment_provider_configs')
export class PaymentProviderConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'enum', enum: ProviderType, default: ProviderType.PAYSTACK })
  providerType: ProviderType;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'text', nullable: true })
  apiKey: string | null;

  @Column({ type: 'text', nullable: true })
  secretKey: string | null;

  @Column({ type: 'text', nullable: true })
  webhookSecret: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  baseUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
