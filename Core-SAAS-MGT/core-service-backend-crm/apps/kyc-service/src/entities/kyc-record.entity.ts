import { AbstractEntity } from '@app/common';
import { Column, Entity, OneToMany } from 'typeorm';
import { KycDocument } from './kyc-document.entity';

export enum KycTier {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
}

export enum KycStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('kyc_records')
export class KycRecord extends AbstractEntity {
  @Column()
  customerId: string;

  @Column()
  tenantId: string;

  @Column({ type: 'varchar', length: 20, default: KycTier.TIER_1 })
  tier: KycTier;

  @Column({ type: 'varchar', length: 20, default: KycStatus.DRAFT })
  status: KycStatus;

  @Column({ default: false })
  bvnVerified: boolean;

  @Column({ nullable: true })
  bvnHash?: string;

  @Column({ default: false })
  ninVerified: boolean;

  @Column({ nullable: true })
  ninHash?: string;

  @Column({ default: false })
  livenessVerified: boolean;

  @Column({ type: 'float', default: 0 })
  livenessScore: number;

  @OneToMany(() => KycDocument, (doc) => doc.kycRecord, { cascade: true })
  documents: KycDocument[];
}
