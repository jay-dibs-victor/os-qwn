import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { UsersRepository } from './users.repository';
import { AuthTokensRepository } from './auth-tokens.repository';
import { Otp } from './entities/otp.entity';
import { EmailService } from '@app/common';
import { TenantService } from './tenant.service';
import { ModuleRef } from '@nestjs/core';

describe('AuthServiceController', () => {
  let authServiceController: AuthServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthServiceController],
      providers: [
        AuthServiceService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: UsersRepository,
          useValue: { findOne: jest.fn(), create: jest.fn() },
        },
        {
          provide: AuthTokensRepository,
          useValue: { findOne: jest.fn(), create: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: getRepositoryToken(Otp),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: EmailService,
          useValue: { sendOtpEmail: jest.fn(), sendPasswordResetEmail: jest.fn() },
        },
        {
          provide: TenantService,
          useValue: { validateTenant: jest.fn() },
        },
        {
          provide: ModuleRef,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    authServiceController = app.get<AuthServiceController>(
      AuthServiceController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(authServiceController.getHello()).toBe('Hello World!');
    });
  });
});
