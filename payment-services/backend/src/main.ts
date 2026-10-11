import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  
  // Middleware to preserve raw body buffer for webhook signature validation
  app.use(
    json({
      verify: (req: any, res, buf) => {
        if (req.url && req.url.includes('/payments/webhooks')) {
          req.rawBody = buf.toString();
        }
      },
    }),
  );
  app.use(urlencoded({ extended: true }));
  
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 5050;
  await app.listen(port);
  console.log(`Payment services backend running on: http://localhost:${port}/api`);
}
bootstrap();
