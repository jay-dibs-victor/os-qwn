import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BatchItem } from './batch-item.entity';

export enum BatchJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
}

@Entity('batch_jobs')
export class BatchJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: BatchJobStatus,
    default: BatchJobStatus.PENDING,
  })
  status: BatchJobStatus;

  @Column()
  tenantId: string;

  @Column()
  createdBy: string;

  @Column({ default: 0 })
  totalItems: number;

  @Column({ default: 0 })
  processedItems: number;

  @Column({ default: 0 })
  successItems: number;

  @Column({ default: 0 })
  failedItems: number;

  @Column({ nullable: true })
  completedAt: Date;

  @OneToMany(() => BatchItem, (item) => item.batchJob, { cascade: true })
  items: BatchItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
