import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KycDocument } from './entities/kyc-document.entity';
import { KycRecord, KycStatus, KycTier } from './entities/kyc-record.entity';
import { KycEventsPublisher } from './kyc-events.publisher';
import { KycVerificationProvider } from './kyc-verification.provider';

@Injectable()
export class KycServiceService {
  constructor(
    @InjectRepository(KycRecord)
    private readonly kycRepo: Repository<KycRecord>,
    @InjectRepository(KycDocument)
    private readonly documentRepo: Repository<KycDocument>,
    private readonly eventsPublisher: KycEventsPublisher,
    private readonly verificationProvider: KycVerificationProvider,
  ) {}

  async createRecord(dto: {
    customerId: string;
    tenantId: string;
  }): Promise<KycRecord> {
    const record = this.kycRepo.create({
      customerId: dto.customerId,
      tenantId: dto.tenantId,
      tier: KycTier.TIER_1,
      status: KycStatus.DRAFT,
    });
    return this.kycRepo.save(record);
  }

  async verifyIdentity(
    kycId: string,
    dto: { bvn: string; nin: string; tenantId: string },
  ): Promise<KycRecord> {
    const record = await this.kycRepo.findOne({ where: { id: kycId } });
    if (!record) throw new BadRequestException('KYC record not found');

    record.bvnHash = this.verificationProvider.hashIdentifier(dto.bvn);
    record.ninHash = this.verificationProvider.hashIdentifier(dto.nin);
    record.bvnVerified = await this.verificationProvider.verifyBvn(dto.bvn);
    record.ninVerified = await this.verificationProvider.verifyNin(dto.nin);

    return this.kycRepo.save(record);
  }

  async submit(kycId: string): Promise<KycRecord> {
    const record = await this.kycRepo.findOne({ where: { id: kycId } });
    if (!record) throw new BadRequestException('KYC record not found');

    if (record.tier === KycTier.TIER_2 && (!record.bvnVerified || !record.ninVerified)) {
      throw new BadRequestException(
        'Tier 2 requires BVN and NIN verification before submission',
      );
    }

    record.status = KycStatus.SUBMITTED;
    const saved = await this.kycRepo.save(record);
    await this.eventsPublisher.publishSubmitted(saved);
    return saved;
  }

  async completeLiveness(
    kycId: string,
    dto: { score: number; tenantId: string },
  ): Promise<KycRecord> {
    const record = await this.kycRepo.findOne({ where: { id: kycId } });
    if (!record) throw new BadRequestException('KYC record not found');

    record.livenessScore = dto.score;
    record.livenessVerified = dto.score >= 0.9;
    return this.kycRepo.save(record);
  }
}
