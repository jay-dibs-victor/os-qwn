import { Entity, Column, Index, Unique } from 'typeorm';
import { AbstractEntity } from '@app/common';

@Entity('site_wide_fare_configs')
@Unique(['configKey'])
export class SiteWideFareConfig extends AbstractEntity {
  @Column()
  @Index()
  configKey: string;

  @Column()
  configValue: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 'STRING' })
  dataType: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
