import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum EntityType {
  TENANT = 'TENANT',
  RIDER = 'RIDER',
  DRIVER = 'DRIVER',
}

@Entity('coin_wallets')
@Index(['entityId', 'entityType'], { unique: true })
@Index(['tenantId'])
export class CoinWallet extends AbstractEntity {
  @Column()
  entityId: string;

  @Column({ type: 'enum', enum: EntityType })
  entityType: EntityType;

  @Column({ type: 'decimal', precision: 20, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 5, default: 'QCOIN' })
  currency: string;

  @Column()
  tenantId: string;
}
