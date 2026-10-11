/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = require('crypto').webcrypto;
}
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LedgerServiceModule } from './ledger-service.module';
import { DatabaseSeeder } from './database.seeder';

async function bootstrap() {
  const app = await NestFactory.create(LedgerServiceModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  try {
    const seeder = app.get(DatabaseSeeder);
    await seeder.seed();
  } catch (error) {
    console.error('Failed to run ledger-service database seeder:', error);
    console.warn('Service will continue despite seeding failure');
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Queens OS — Ledger & Financial Accounting Service')
    .setDescription(`
## Overview
Enterprise double-entry General Ledger, posting engine, audit, commissions, revenue, escrow, and coin rewards.

## Quick Start
1. Create GL accounts via **POST /ledger/accounts** (accepts uppercase or lowercase type)
2. Post balanced transactions via **POST /ledger/posting/transaction**
3. Query audit trail via **GET /ledger/audit/trail/:reference**
4. Check trial balance via **GET /ledger/audit/trial-balance**

## GL Account Types
| Type | Description |
|------|-------------|
| \`asset\` | Cash, receivables, clearing accounts |
| \`liability\` | Customer wallet, driver payable, escrow obligations |
| \`income\` | Platform revenue, commission, subscription fees |
| \`expense\` | Driver payout costs, swap hardware costs |
| \`equity\` | Retained earnings, capital |

## GL Account Codes (seeded by auth-service)
| Code | Name | Type |
|------|------|------|
| 1100 | Platform Cash Pool | asset |
| 1200 | Rider Receivables | asset |
| 1300 | Chama Escrow Receivable | asset |
| 2100 | Driver Payable | liability |
| 2300 | Chama Escrow Liability | liability |
| 4100 | Platform Revenue | income |
| 4200 | Commission Income | income |
| 4300 | Chama Loan Income | income |
| 4400 | Green Swap Credits | income |
| 4500 | Driver Subscription | income |
| 4600 | Partner Subscription | income |
| 5100 | Driver Payout Expense | expense |
| 5200 | Solar Swap Expense | expense |

Note: These codes exist in the **auth-service** postgres. The ledger-service has its own postgres — create accounts here via **POST /ledger/accounts** before posting transactions.
    `)
    .setVersion('2.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', description: 'JWT from /auth/login', in: 'header' },
      'JWT-auth',
    )
    .addTag('General Ledger', 'Chart of accounts — create, list, update GL accounts')
    .addTag('Ledger Posting', 'Post balanced double-entry transactions to the ledger')
    .addTag('Ledger Transactions', 'Query posted journal entries and transaction history')
    .addTag('Ledger Audit', 'Trial balance, profit & loss, balance sheet, audit trail')
    .addTag('Ledger Commissions', 'Commission rules, calculation, and distribution')
    .addTag('Ledger Revenue', 'Trip revenue recording and revenue summaries')
    .addTag('Coin Reward', 'QCoin rewards for eco-friendly driver behavior')
    .addTag('Escrow', 'Chama escrow wallet management')
    .addTag('Site-Wide Fare Config', 'Platform-wide fare rules and configuration')
    .addTag('Tenant Remittance Config', 'Per-tenant driver remittance configuration')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: 3,
    },
    customSiteTitle: 'Queens OS Ledger Service API',
  });

  await app.listen(process.env.PORT || 3003, '0.0.0.0');
}
void bootstrap();
