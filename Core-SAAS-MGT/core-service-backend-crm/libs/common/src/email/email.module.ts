import { DynamicModule, Module } from '@nestjs/common';
import { EmailService, EMAIL_TEMPLATE_DIR } from './email.service';

@Module({})
export class EmailModule {
  static forRoot(templateDir: string): DynamicModule {
    return {
      module: EmailModule,
      global: true,
      providers: [
        {
          provide: EMAIL_TEMPLATE_DIR,
          useValue: templateDir,
        },
        EmailService,
      ],
      exports: [EmailService],
    };
  }
}
