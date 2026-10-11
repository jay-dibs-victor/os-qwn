import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { BatchJob } from './batch-job.entity';

export enum BatchItemStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('batch_items')
export class BatchItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sourceAccountId: string;

  @Column()
  destinationAccountId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: BatchItemStatus,
    default: BatchItemStatus.PENDING,
  })
  status: BatchItemStatus;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  errorDetails: string;

  @Column({ nullable: true })
  processedAt: Date;

  @ManyToOne(() => BatchJob, (job) => job.items)
  batchJob: BatchJob;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
