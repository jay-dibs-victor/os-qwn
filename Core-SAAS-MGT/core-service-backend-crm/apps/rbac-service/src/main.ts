/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RbacServiceModule } from './rbac-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RbacServiceModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('RBAC Service')
    .setDescription('Role-based access control, permissions, and policies microservice')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('RBAC Service')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
void bootstrap();
