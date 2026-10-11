import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KycRecord, KycStatus, KycTier } from './entities/kyc-record.entity';
import { KycDocument } from './entities/kyc-document.entity';

const DRIVERS_BY_TENANT: Record<string, string[]> = {
  'root-admin': Array.from({ length: 10 }, (_, i) => String(1000000001 + i)),
  'tenant-001': Array.from({ length: 10 }, (_, i) => String(1000000026 + i)),
  'tenant-002': Array.from({ length: 10 }, (_, i) => String(1000000051 + i)),
  'acme-corp':  Array.from({ length: 10 }, (_, i) => String(1000000076 + i)),
};

const PARTNERS_BY_TENANT: Record<string, Array<{ customerId: string; name: string }>> = {
  'root-admin': [
    { customerId: '1001000003', name: 'Chidi Okonkwo' },
  ],
  'tenant-001': [
    { customerId: '1001000004', name: 'Moove Africa' },
  ],
  'acme-corp': [
    { customerId: '1001000006', name: 'Lasgrid Transport Ltd' },
  ],
};

const DOC_NAMES = ['National ID', 'Driver License', 'Utility Bill', 'Passport Photo', 'Insurance Certificate'];
const DOC_TYPES = ['id_card', 'drivers_license', 'utility_bill', 'passport', 'insurance'];
const DOC_URLS = [
  'https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600',
];

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(KycRecord)
    private readonly kycRecordRepository: Repository<KycRecord>,
    @InjectRepository(KycDocument)
    private readonly kycDocumentRepository: Repository<KycDocument>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding KYC records for existing drivers...');
    try {
      await this.kycRecordRepository.query('TRUNCATE TABLE kyc_documents CASCADE');
      await this.kycRecordRepository.query('TRUNCATE TABLE kyc_records CASCADE');

      for (const [tenantId, driverIds] of Object.entries(DRIVERS_BY_TENANT)) {
        for (const customerId of driverIds) {
          const existing = await this.kycRecordRepository.findOne({ where: { customerId, tenantId } });
          if (existing) continue;

          const bvnVerified = Math.random() > 0.2;
          const ninVerified = Math.random() > 0.3;
          const livenessVerified = Math.random() > 0.1;

          const record = this.kycRecordRepository.create({
            customerId,
            tenantId,
            tier: KycTier.TIER_2,
            status: KycStatus.APPROVED,
            bvnVerified,
            bvnHash: bvnVerified ? `bvn_hash_${customerId}` : undefined,
            ninVerified,
            ninHash: ninVerified ? `nin_hash_${customerId}` : undefined,
            livenessVerified,
            livenessScore: livenessVerified ? Math.round((70 + Math.random() * 29) * 10) / 10 : 0,
          });
          const saved = await this.kycRecordRepository.save(record);

          const docCount = Math.floor(Math.random() * 2) + 2;
          for (let d = 0; d < docCount; d++) {
            const doc = this.kycDocumentRepository.create({
              fileName: DOC_NAMES[d],
              fileType: DOC_TYPES[d],
              fileUrl: DOC_URLS[d],
              verifiedAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 86400000),
              kycRecord: saved,
            });
            await this.kycDocumentRepository.save(doc);
          }
        }
        this.logger.log(`  ✓ Seeded KYC records for ${tenantId} drivers`);
      }

      // Seed KYC for partners that need onboarding verification
      for (const [tenantId, partners] of Object.entries(PARTNERS_BY_TENANT)) {
        for (const p of partners) {
          const existing = await this.kycRecordRepository.findOne({ where: { customerId: p.customerId, tenantId } });
          if (existing) continue;

          const record = this.kycRecordRepository.create({
            customerId: p.customerId,
            tenantId,
            tier: KycTier.TIER_2,
            status: KycStatus.APPROVED,
            bvnVerified: true,
            bvnHash: `bvn_hash_${p.customerId}`,
            ninVerified: true,
            ninHash: `nin_hash_${p.customerId}`,
            livenessVerified: true,
            livenessScore: 95.0,
          });
          const saved = await this.kycRecordRepository.save(record);

          const doc = this.kycDocumentRepository.create({
            fileName: 'Certificate of Incorporation',
            fileType: 'incorporation_cert',
            fileUrl: DOC_URLS[0],
            verifiedAt: new Date(Date.now() - 30 * 86400000),
            kycRecord: saved,
          });
          await this.kycDocumentRepository.save(doc);
        }
        this.logger.log(`  ✓ Seeded KYC records for ${tenantId} partners`);
      }

      this.logger.log('KYC seeding completed successfully');
    } catch (error) {
      this.logger.error('KYC seeding failed:', error);
      this.logger.warn('Service will continue despite seeding failure');
    }
  }
}
