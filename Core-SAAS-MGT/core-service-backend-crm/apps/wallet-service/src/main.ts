/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = require('crypto').webcrypto;
}
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WalletServiceModule } from './wallet-service.module';
import { DatabaseSeeder } from './database.seeder';

async function bootstrap() {
  const app = await NestFactory.create(WalletServiceModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  try {
    const seeder = app.get(DatabaseSeeder);
    await seeder.seed();
  } catch (error) {
    console.error('Failed to run wallet-service database seeder:', error);
    console.warn('Service will continue despite seeding failure');
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wallet Service')
    .setDescription('Wallet, remittance, driver savings, earnings, and partner settlements microservice')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Wallet Service')
    .addTag('Driver Savings')
    .addTag('Driver Earnings')
    .addTag('Partner Settlements')
    .addTag('Remittance')
    .addTag('Scheduler')
    .addTag('Driver Debt')
    .addTag('Driver Ledger')
    .addTag('Fraud Detection')
    .addTag('Disputes')
    .addTag('Driver Payments')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3015, '0.0.0.0');
}
void bootstrap();
