import { Entity, Column, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';

@Entity('policies')
export class Policy extends AbstractEntity {
  @Index()
  @Column()
  name!: string;

  @Column({ type: 'json' })
  rules!: any;

  @Index()
  @Column()
  tenantId!: string;
}
