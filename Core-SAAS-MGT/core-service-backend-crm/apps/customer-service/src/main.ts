if (typeof global.crypto === 'undefined') {
  (global as any).crypto = require('crypto').webcrypto;
}
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CustomerServiceModule } from './customer-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CustomerServiceModule);
  app.useGlobalPipes(new ValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Customer Service')
    .setDescription('Customer accounts management microservice')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Customer Accounts')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3014, '0.0.0.0');
}
void bootstrap();
