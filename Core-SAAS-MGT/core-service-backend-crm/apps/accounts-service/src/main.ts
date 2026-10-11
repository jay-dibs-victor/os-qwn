/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
if (typeof global.crypto === 'undefined') {
  (global as any).crypto = require('crypto').webcrypto;
}
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AccountsModule } from './accounts.module';

async function bootstrap() {
  const app = await NestFactory.create(AccountsModule);
  app.useGlobalPipes(new ValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Accounts Service')
    .setDescription('Account management microservice')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Account Management')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3005, '0.0.0.0');
}
void bootstrap();
