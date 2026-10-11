import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KycDocument } from './entities/kyc-document.entity';
import { KycRecord, KycStatus, KycTier } from './entities/kyc-record.entity';
import { KycEventsPublisher } from './kyc-events.publisher';
import { KycServiceService } from './kyc-service.service';
import { KycVerificationProvider } from './kyc-verification.provider';

describe('KycServiceService', () => {
  let service: KycServiceService;
  let record: KycRecord;

  const kycRepo = {
    create: jest.fn((dto) => ({ id: 'kyc-1', ...dto })),
    save: jest.fn((entity) => entity),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const documentRepo = {
    create: jest.fn((dto) => ({ id: 'doc-1', ...dto })),
    save: jest.fn((entity) => entity),
  };
  const eventsPublisher = {
    publishSubmitted: jest.fn(),
    publishApproved: jest.fn(),
    publishRejected: jest.fn(),
  };

  beforeEach(async () => {
    record = {
      id: 'kyc-1',
      customerId: 'customer-1',
      tenantId: 'tenant-1',
      tier: KycTier.TIER_2,
      status: KycStatus.DRAFT,
      bvnVerified: false,
      ninVerified: false,
      livenessVerified: false,
      livenessScore: 0,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    kycRepo.findOne.mockResolvedValue(record);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycServiceService,
        KycVerificationProvider,
        {
          provide: getRepositoryToken(KycRecord),
          useValue: kycRepo,
        },
        {
          provide: getRepositoryToken(KycDocument),
          useValue: documentRepo,
        },
        {
          provide: KycEventsPublisher,
          useValue: eventsPublisher,
        },
      ],
    }).compile();

    service = module.get<KycServiceService>(KycServiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates a draft KYC record', async () => {
    const saved = await service.createRecord({
      customerId: 'customer-1',
      tenantId: 'tenant-1',
    });

    expect(saved.status).toBe(KycStatus.DRAFT);
    expect(saved.tier).toBe(KycTier.TIER_1);
  });

  it('hashes BVN and NIN instead of storing raw identifiers', async () => {
    const saved = await service.verifyIdentity('kyc-1', {
      bvn: '12345678901',
      nin: '10987654321',
      tenantId: 'tenant-1',
    });

    expect(saved.bvnVerified).toBe(true);
    expect(saved.ninVerified).toBe(true);
    expect(saved.bvnHash).not.toBe('12345678901');
    expect(saved.ninHash).not.toBe('10987654321');
  });

  it('requires Tier 2 records to have BVN and NIN before submit', async () => {
    record.bvnVerified = true;

    await expect(service.submit('kyc-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('submits once tier requirements are met', async () => {
    record.bvnVerified = true;
    record.ninVerified = true;

    const saved = await service.submit('kyc-1');

    expect(saved.status).toBe(KycStatus.SUBMITTED);
    expect(eventsPublisher.publishSubmitted).toHaveBeenCalledWith(saved);
  });

  it('passes liveness when score is high enough', async () => {
    const saved = await service.completeLiveness('kyc-1', {
      score: 0.91,
      tenantId: 'tenant-1',
    });

    expect(saved.livenessVerified).toBe(true);
    expect(saved.livenessScore).toBe(0.91);
  });
});
