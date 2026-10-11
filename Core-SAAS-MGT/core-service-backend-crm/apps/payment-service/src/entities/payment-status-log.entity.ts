import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { PaymentInstruction } from './payment-instruction.entity';
import { PaymentStatus } from '../constants/enums';

@Entity('payment_status_logs')
export class PaymentStatusLog extends AbstractEntity {
  @ManyToOne(() => PaymentInstruction, (payment) => payment.statusLogs, {
    onDelete: 'CASCADE',
  })
  @Index()
  paymentInstruction: PaymentInstruction;

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  providerResponse?: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  at: Date;
}
