if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthServiceModule } from './auth-service.module';
import { DatabaseSeeder } from './database.seeder';
import { LedgerSeeder } from './analytics/ledger.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);
  
  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins for internal service
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);
  
  // Run database seeder on startup (idempotent - safe to run multiple times)
  try {
    const seeder = app.get(DatabaseSeeder);
    await seeder.seed();
  } catch (error) {
    console.error('Failed to run database seeder:', error);
    console.warn('Service will continue to start despite seeding failure');
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Queens OS — Auth & Financial Core Service')
    .setDescription(`
## Overview
Auth, customer management, GL analytics, and file upload service.
This is the source of truth for users, customers (drivers/riders/partners), tenants, and financial analytics.

## Quick Start
1. **POST /auth/login** → get \`access_token\`
2. Click **Authorize** → paste token
3. Explore endpoints

## Seeded Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Root Admin | admin@queensos.com | Admin@123456 |
| Tenant Admin | admin@tenant-001.com | Admin@123456 |
| Account Officer | finance@tenant-001.com | Finance@123456 |
| Staff | user@tenant-001.com | User@123456 |

## Customer Types
- **driver** — Individual or corporate fleet driver (has licenseNumber, vehicleModel, metadata.docs)
- **rider** — End-user / passenger
- **partner** — Ecosystem partner (bank, telecom, fleet operator, fintech, individual)

## Upload Provider
Active provider: **Cloudinary** (cloud name: questence)
Switch to S3 by setting \`UPLOAD_PROVIDER=s3\` in env.
    `)
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Paste access_token from /auth/login (without Bearer prefix)',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Login, register, MFA, OTP, password reset, token refresh')
    .addTag('Auth Google OAuth', 'Google OAuth 2.0 sign-in flow')
    .addTag('Customers', 'All customer types: drivers, riders, partners — CRUD + lifecycle')
    .addTag('Tenant Management', 'Tenant registration, suspend, activate, plan management')
    .addTag('User Management', 'Platform users: create staff, account officers, tenant admins')
    .addTag('Analytics', 'Real-time KPI dashboard metrics and chart data from GL ledger')
    .addTag('General Ledger', 'GL accounts, journal entries, balance queries')
    .addTag('File Upload', 'Document upload via Cloudinary or S3 adapter')
    .addTag('Tenant Settings', 'Per-tenant config: currency, commission rates, feature flags')
    .addTag('Scope Management', 'Fine-grained scope assignment per user/tenant')
    .addTag('OAuth 2.0', 'OAuth 2.0 authorization flows and token management')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: false,
      filter: true,
      showRequestHeaders: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Queens OS Auth Service API',
  });

  await app.listen(configService.get('PORT') || 3001, '0.0.0.0');
  console.log(`Auth Service running on port ${configService.get('PORT') || 3001}`);

  // Run ledger seeder in background (non-blocking) after server starts
  try {
    const ledgerSeeder = app.get(LedgerSeeder);
    await ledgerSeeder.seed();
  } catch (error) {
    console.error('Failed to run ledger seeder:', error);
    console.warn('Service will continue to run despite ledger seeding failure');
  }
}
void bootstrap();
