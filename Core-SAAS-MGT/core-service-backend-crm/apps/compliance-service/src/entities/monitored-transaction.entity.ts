import { AbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity('monitored_transactions')
export class MonitoredTransaction extends AbstractEntity {
  @Column()
  transactionId: string;

  @Column()
  customerId: string;

  @Column({ nullable: true })
  counterpartyName?: string;

  @Column({ type: 'float', default: 0 })
  amount: number;

  @Column()
  tenantId: string;
}
