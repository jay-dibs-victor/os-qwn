/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalServiceService } from './approval-service.service';
import { ApprovalConfigsRepository } from './repositories/approval-configs.repository';
import { ApprovalRequestsRepository } from './repositories/approval-requests.repository';
import { ApprovalStepsRepository } from './repositories/approval-steps.repository';
import { ApprovalRequestStatus } from './entities/approval-request.entity';
import { ConfigService } from '@nestjs/config';

describe('ApprovalServiceService', () => {
  let service: ApprovalServiceService;
  let configsRepo: any;
  let requestsRepo: any;
  let stepsRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalServiceService,
        {
          provide: ApprovalConfigsRepository,
          useValue: { find: jest.fn() },
        },
        {
          provide: ApprovalRequestsRepository,
          useValue: { findone: jest.fn(), create: jest.fn() },
        },
        {
          provide: ApprovalStepsRepository,
          useValue: { create: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://gateway') },
        },
      ],
    }).compile();

    service = module.get<ApprovalServiceService>(ApprovalServiceService);
    configsRepo = module.get<ApprovalConfigsRepository>(
      ApprovalConfigsRepository,
    );
    requestsRepo = module.get<ApprovalRequestsRepository>(
      ApprovalRequestsRepository,
    );
    stepsRepo = module.get<ApprovalStepsRepository>(ApprovalStepsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('approveStep', () => {
    it('should throw error if request is already approved', async () => {
      requestsRepo.findOne = jest.fn().mockResolvedValue({
        status: ApprovalRequestStatus.APPROVED,
      });

      await expect(
        service.approveStep('1', { approverId: '2' }),
      ).rejects.toThrow('Request is already processed.');
    });

    it('should throw error if initiator is the approver', async () => {
      requestsRepo.findOne = jest.fn().mockResolvedValue({
        status: ApprovalRequestStatus.PENDING,
        initiatorId: 'user-1',
      });

      await expect(
        service.approveStep('1', { approverId: 'user-1' }),
      ).rejects.toThrow('Initiator cannot approve their own request.');
    });

    it('should approve level 1 and move to level 2', async () => {
      const request = {
        id: 'req-1',
        method: 'POST',
        path: '/test',
        tenantId: 't1',
        status: ApprovalRequestStatus.PENDING,
        initiatorId: 'user-1',
        steps: [],
      };

      const config = {
        levels: [
          { level: 1, allowedUserIds: ['approver-1'] },
          { level: 2, allowedUserIds: ['approver-2'] },
        ],
      };

      requestsRepo.findOne = jest.fn().mockResolvedValue(request);
      configsRepo.find = jest
        .fn()
        .mockResolvedValue([
          { ...config, path: '/test', method: 'POST', isEnabled: true },
        ]);
      stepsRepo.create = jest.fn().mockResolvedValue({});

      const result = await service.approveStep('req-1', {
        approverId: 'approver-1',
      });

      expect(result.message).toBe('Approved level 1');
      expect(result.status).toBe(ApprovalRequestStatus.PENDING);
    });

    it('should approve last level and set request status to APPROVED', async () => {
      const request = {
        id: 'req-1',
        method: 'POST',
        path: '/test',
        tenantId: 't1',
        status: ApprovalRequestStatus.PENDING,
        initiatorId: 'user-1',
        steps: [{ level: 1, approverId: 'approver-1' }],
      };

      const config = {
        levels: [
          { level: 1, allowedUserIds: ['approver-1'] },
          { level: 2, allowedUserIds: ['approver-2'] },
        ],
      };

      requestsRepo.findOne = jest.fn().mockResolvedValue(request);
      configsRepo.find = jest
        .fn()
        .mockResolvedValue([
          { ...config, path: '/test', method: 'POST', isEnabled: true },
        ]);
      stepsRepo.create = jest.fn().mockResolvedValue({});
      requestsRepo.create = jest.fn().mockResolvedValue({});

      const result = await service.approveStep('req-1', {
        approverId: 'approver-2',
      });

      expect(result.message).toBe('Approved level 2');
      expect(result.status).toBe(ApprovalRequestStatus.APPROVED);
    });
  });
});
