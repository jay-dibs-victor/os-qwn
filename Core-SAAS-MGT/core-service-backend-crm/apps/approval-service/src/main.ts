/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApprovalServiceModule } from './approval-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ApprovalServiceModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Approval Service')
    .setDescription('Approval workflows and configurations microservice')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Approvals')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
void bootstrap();
