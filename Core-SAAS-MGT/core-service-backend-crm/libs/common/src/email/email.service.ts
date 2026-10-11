import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export const EMAIL_TEMPLATE_DIR = 'EMAIL_TEMPLATE_DIR';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromAddress: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(EMAIL_TEMPLATE_DIR) private readonly templateDir: string,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured. Email sending will fail.');
      this.resend = new Resend('re_placeholder');
    } else {
      this.resend = new Resend(apiKey);
    }

    const fromEmail = this.configService.get<string>('MAIL_FROM_EMAIL') || 'noreply@queensos.com';
    const fromName = this.configService.get<string>('MAIL_FROM_NAME') || 'Queens OS';
    this.fromAddress = `${fromName} <${fromEmail}>`;
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(
      process.cwd(),
      this.templateDir,
      `${templateName}.hbs`,
    );

    if (!fs.existsSync(templatePath)) {
      this.logger.warn(`Template ${templateName} not found at ${templatePath}`);
      return '{{message}}';
    }

    return fs.readFileSync(templatePath, 'utf-8');
  }

  private compileTemplate(templateName: string, context: Record<string, any>): string {
    const templateSource = this.loadTemplate(templateName);
    const template = Handlebars.compile(templateSource);
    return template(context);
  }

  async send(params: {
    to: string;
    subject: string;
    templateName: string;
    context: Record<string, any>;
  }): Promise<void> {
    const html = this.compileTemplate(params.templateName, params.context);

    try {
      await this.resend.emails.send({
        from: this.fromAddress,
        to: [params.to],
        subject: params.subject,
        html,
      });
      this.logger.log(`Email sent to ${params.to}: ${params.subject}`);
    } catch (error) {
      this.logger.warn(
        `Failed to send email using configured fromAddress (${this.fromAddress}). ` +
          `Retrying with onboarding@resend.dev fallback. Error: ${error instanceof Error ? error.message : String(error)}`,
      );
      try {
        const fallbackAddress = `Queens OS Platform <onboarding@resend.dev>`;
        await this.resend.emails.send({
          from: fallbackAddress,
          to: [params.to],
          subject: params.subject,
          html,
        });
        this.logger.log(`Email successfully sent to ${params.to} using fallback sender`);
      } catch (fallbackError) {
        this.logger.error(
          `Failed fallback email send to ${params.to}: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
        );
        throw error;
      }
    }
  }
}
