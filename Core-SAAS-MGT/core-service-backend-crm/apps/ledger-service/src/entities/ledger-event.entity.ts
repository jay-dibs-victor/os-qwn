import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

@Entity('ledger_events')
@Index(['streamId', 'version'], { unique: true })
export class LedgerEvent extends AbstractEntity {
  @Column()
  @Index()
  streamId: string;

  @Column()
  type: string;

  @Column({ type: 'jsonb' })
  data: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column()
  version: number;

  @Column()
  @Index()
  tenantId: string;
}
