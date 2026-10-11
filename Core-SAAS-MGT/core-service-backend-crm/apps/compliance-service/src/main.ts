/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ComplianceServiceModule } from './compliance-service.module';

async function bootstrap() {
  if (typeof global.crypto === 'undefined') {
    /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    (global as any).crypto = require('crypto').webcrypto;
    /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
  }
  const app = await NestFactory.create(ComplianceServiceModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Compliance Service')
    .setDescription('Compliance and regulatory microservice')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Compliance Service')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3011, '0.0.0.0');
}
void bootstrap();
