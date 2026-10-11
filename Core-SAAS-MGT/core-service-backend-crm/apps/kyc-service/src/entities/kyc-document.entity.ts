import { AbstractEntity } from '@app/common';
import { Column, Entity, ManyToOne } from 'typeorm';
import { KycRecord } from './kyc-record.entity';

@Entity('kyc_documents')
export class KycDocument extends AbstractEntity {
  @Column()
  fileName: string;

  @Column()
  fileType: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  verifiedAt?: Date;

  @ManyToOne(() => KycRecord, (record) => record.documents)
  kycRecord: KycRecord;
}
