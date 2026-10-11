import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_scopes')
@Unique(['userUuid', 'scopeId'])
@Index(['userUuid'])
@Index(['scopeId'])
@Index(['tenantId'])
@Index(['isEnabled'])
@Index(['userUuid', 'tenantId', 'isEnabled'])
export class UserScope {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userUuid: string; // Foreign key to User.id (UUID)

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userUuid', referencedColumnName: 'id' })
  user: User;

  @Column()
  tenantId: string; // Cached tenantId string for security validation

  @Column()
  scopeId: string; // Reference to Scope.scopeId

  @Column()
  scopeName: string; // Cached scope name for quick access

  @Column({ type: 'text', nullable: true })
  scopeDescription: string; // Cached scope description

  @Column({ default: true })
  isEnabled: boolean; // Whether this scope is enabled for the user

  @Column({ nullable: true })
  grantedBy: string; // User ID who granted this scope (usually tenant admin)

  @Column({ nullable: true })
  approvedBy: string; // User ID who approved this scope (if requiresApproval)

  @Column({ nullable: true })
  approvedAt: Date; // When this scope was approved

  @Column({ nullable: true })
  expiresAt: Date; // Optional expiration date for temporary scopes

  @Column({ type: 'simple-array', default: '' })
  restrictions: string[]; // Additional restrictions for this user (e.g., 'max_daily_transactions:500')

  @Column({ default: 0 })
  usageCount: number; // Track how many times this scope is used

  @Column({ nullable: true })
  lastUsedAt: Date; // Last time this scope was used

  @Column({ type: 'simple-array', default: '' })
  dataRestrictions: string[]; // Data-level restrictions (e.g., 'region:north', 'vehicle_type:sedan')

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  metadata: string; // JSON string for additional metadata
}
