/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { OverdraftServiceModule } from './overdraft-service.module';

async function bootstrap() {
  if (typeof global.crypto === 'undefined') {
    (global as any).crypto = require('crypto').webcrypto;
  }
  const app = await NestFactory.create(OverdraftServiceModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Overdraft Service')
    .setDescription('Overdraft management microservice')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3015, '0.0.0.0');
}
void bootstrap();
