import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum CoinTransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

@Entity('coin_transactions')
@Index(['walletId'])
@Index(['tenantId'])
@Index(['tripId'])
export class CoinTransaction extends AbstractEntity {
  @Column()
  walletId: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: CoinTransactionType })
  type: CoinTransactionType;

  @Column()
  reference: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  tripId?: string;

  @Column()
  tenantId: string;

  @Column({ nullable: true })
  counterPartyEntityId?: string;

  @Column({ nullable: true })
  counterPartyEntityType?: string;
}
