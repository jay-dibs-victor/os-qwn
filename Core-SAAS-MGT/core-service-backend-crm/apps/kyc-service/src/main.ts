/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { KycServiceModule } from './kyc-service.module';
import { DatabaseSeeder } from './database.seeder';

async function bootstrap() {
  if (typeof global.crypto === 'undefined') {
    /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    (global as any).crypto = require('crypto').webcrypto;
    /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
  }
  const app = await NestFactory.create(KycServiceModule);

  try {
    const seeder = app.get(DatabaseSeeder);
    await seeder.seed();
  } catch (error) {
    console.error('Failed to run kyc-service database seeder:', error);
    console.warn('Service will continue despite seeding failure');
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('KYC Service')
    .setDescription('Know Your Customer verification microservice')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('KYC Service')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3010, '0.0.0.0');
}
void bootstrap();
