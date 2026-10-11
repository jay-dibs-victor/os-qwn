import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import Mailjet from 'node-mailjet';
import { Resend } from 'resend';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

export interface MailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  locals?: any;
}

interface IMailProvider {
  send(options: MailOptions): Promise<any>;
}

// ─── SendGrid Provider ──────────────────────────────────────────────────────
class SendGridProvider implements IMailProvider {
  private sgMail: any;

  constructor() {
    // Lazy-require SendGrid to avoid loading the package when not needed
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sg = require('@sendgrid/mail');
      sg.setApiKey(process.env.SENDGRID_API_KEY || '');
      this.sgMail = sg;
    } catch (e) {
      // Propagate so caller can fall back to MockProvider
      throw e;
    }
  }

  async send(options: MailOptions): Promise<any> {
    const msg = {
      to: options.to,
      from: options.from || process.env.EMAIL_FROM || 'Queens <no-reply@queens.com>',
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    return this.sgMail.send(msg);
  }
}

// ─── Brevo (Sendinblue) Provider ─────────────────────────────────────────────
class BrevoProvider implements IMailProvider {
  private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

  constructor() {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  }

  async send(options: MailOptions): Promise<any> {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.html || options.text;
    sendSmtpEmail.sender = { name: 'Queens', email: options.from || process.env.EMAIL_FROM || 'no-reply@queens.com' };
    sendSmtpEmail.to = [{ email: options.to }];
    
    return this.apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}

// ─── Mailjet Provider ────────────────────────────────────────────────────────
class MailjetProvider implements IMailProvider {
  private client: any;

  constructor() {
    this.client = (Mailjet as any).apiConnect(
      process.env.MAILJET_API_KEY || '',
      process.env.MAILJET_API_SECRET || ''
    );
  }

  async send(options: MailOptions): Promise<any> {
    const [fromName, fromEmail] = this.parseFrom(options.from || process.env.EMAIL_FROM || 'Queens <no-reply@queens.com>');
    
    return this.client.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: { Email: fromEmail, Name: fromName },
          To: [{ Email: options.to }],
          Subject: options.subject,
          TextPart: options.text,
          HTMLPart: options.html,
        },
      ],
    });
  }

  private parseFrom(from: string): [string, string] {
    const match = from.match(/(.*)<(.*)>/);
    if (match) return [match[1].trim(), match[2].trim()];
    return ['Queens', from];
  }
}

// ─── Resend Provider ─────────────────────────────────────────────────────────
class ResendProvider implements IMailProvider {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async send(options: MailOptions): Promise<any> {
    return this.resend.emails.send({
      from: options.from || process.env.EMAIL_FROM || 'Queens <no-reply@queens.com>',
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
    });
  }
}

// ─── Mock Provider (for development / missing credentials) ───────────────────
class MockProvider implements IMailProvider {
  async send(options: MailOptions): Promise<any> {
    const from = options.from || process.env.EMAIL_FROM || 'no-reply@queens.com';
    console.warn('MockProvider: would send email', { to: options.to, from, subject: options.subject });
    // Optionally write to disk for inspection in development
    try {
      const out = `[${new Date().toISOString()}] MOCK EMAIL to=${options.to} from=${from} subject=${options.subject}\n${options.text || ''}\n`;
      const logDir = path.join(__dirname, '../../../../../tmp');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.appendFileSync(path.join(logDir, 'mock-emails.log'), out);
    } catch (e) {
      // ignore logging errors in mock
    }
    return Promise.resolve({ mocked: true });
  }
}

// ─── Universal Mail Service ──────────────────────────────────────────────────
class UniversalMailService {
  private provider: IMailProvider;
  private templateDir: string;

  constructor() {
    const serviceType = (process.env.EMAIL_SERVICE || 'sendgrid').toLowerCase();
    this.templateDir = path.join(__dirname, '../views/templates');

    switch (serviceType) {
      case 'brevo':
        try {
          this.provider = new BrevoProvider();
        } catch (e) {
          console.error('BrevoProvider initialization failed, falling back to MockProvider', e);
          this.provider = new MockProvider();
        }
        break;
      case 'mailjet':
        try {
          this.provider = new MailjetProvider();
        } catch (e) {
          console.error('MailjetProvider initialization failed, falling back to MockProvider', e);
          this.provider = new MockProvider();
        }
        break;
      case 'resend':
        try {
          this.provider = new ResendProvider();
        } catch (e) {
          console.error('ResendProvider initialization failed, falling back to MockProvider', e);
          this.provider = new MockProvider();
        }
        break;
      case 'sendgrid':
        // If no SendGrid API key is provided, fall back to a harmless mock provider
        // if (!process.env.SENDGRID_API_KEY) {
        //   console.warn('SENDGRID_API_KEY not set — UniversalMailService falling back to MockProvider');
        //   this.provider = new MockProvider();
        // } else {
        //   try {
        //     this.provider = new SendGridProvider();
        //   } catch (e) {
        //     console.error('SendGridProvider initialization failed, falling back to MockProvider', e);
        //     this.provider = new MockProvider();
        //   }
        // }
        this.provider = new MockProvider();
        break;
      default:
        // Unknown or unspecified service — use mock in development to avoid crashes
        console.warn(`Unknown EMAIL_SERVICE "${serviceType}" — using MockProvider`);
        this.provider = new MockProvider();
        break;
    }
    // Log the actual provider used (class name) and requested service type
    const providerName = this.provider && (this.provider as any).constructor ? (this.provider as any).constructor.name : 'UnknownProvider';
    console.log(`UniversalMailService initialized with provider: ${providerName} (requested: ${serviceType})`);
  }

  async send(options: MailOptions): Promise<any> {
    // If template is provided, render it first
    if (options.template) {
      const { html, text } = await this.renderTemplate(options.template, options.locals || {});
      options.html = html;
      options.text = text;
    }

    return this.provider.send(options);
  }

  private async renderTemplate(templateName: string, locals: any): Promise<{ html: string; text: string }> {
    // Basic handlebars rendering for local templates
    const htmlPath = path.join(this.templateDir, `${templateName}.html`);
    // Note: If templates are actually folders in email-templates style, we'd adjust here.
    // Given current findings, they are flat .html files in views/templates.
    
    if (fs.existsSync(htmlPath)) {
      const source = fs.readFileSync(htmlPath, 'utf8');
      const template = handlebars.compile(source);
      const html = template(locals);
      // For text, we'll just use a simple html-to-text or same content if needed
      return { html, text: html.replace(/<[^>]*>?/gm, '') };
    }
    
    throw new Error(`Template ${templateName} not found at ${htmlPath}`);
  }
}

// Export safely: if initialization throws for any reason, provide a minimal mock
let mailService: any;
try {
  mailService = new UniversalMailService();
} catch (e) {
  console.error('UniversalMailService failed to initialize, exporting a safe mock instead', e);
  mailService = {
    send: async (_opts: MailOptions) => ({ mocked: true }),
  };
}

export default mailService as UniversalMailService;
