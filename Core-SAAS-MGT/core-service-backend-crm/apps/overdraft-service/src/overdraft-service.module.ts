import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/overdraft-service/.env',
    }),
  ],
  controllers: [],
  providers: [],
})
export class OverdraftServiceModule {}
