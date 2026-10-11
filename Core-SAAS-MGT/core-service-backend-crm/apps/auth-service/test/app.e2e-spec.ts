import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthServiceModule } from './../src/auth-service.module';

describe('AuthServiceController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthServiceModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
 
  it('/auth (GET)', () => {
    return request(app.getHttpServer())
      .get('/auth')
      .expect(200)
      .expect('Hello World!');
  });
});
