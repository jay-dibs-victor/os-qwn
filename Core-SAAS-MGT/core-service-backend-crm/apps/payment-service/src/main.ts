if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}
import { NestFactory } from '@nestjs/core';
import { PaymentServiceModule } from './payment-service.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DatabaseSeeder } from './database.seeder';

async function bootstrap() {
  const app = await NestFactory.create(PaymentServiceModule, { rawBody: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3006;

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Payment Service')
    .setDescription('Payment initiation, processing, and status tracking microservice')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Payments')
    .addTag('Trip Payment')
    .addTag('Payment Accounts')
    .addTag('Fleet Contracts')
    .addTag('Marketplace Ledger')
    .addTag('Payment Providers')
    .addTag('Provider Regions')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  Logger.log(`Payment Service running on port ${port}`, 'Bootstrap');

  try {
    const seeder = app.get(DatabaseSeeder);
    await seeder.seed();
  } catch (error) {
    Logger.error('PaymentAccount seeding failed:', error, 'Bootstrap');
  }
}
bootstrap().catch(console.error);
