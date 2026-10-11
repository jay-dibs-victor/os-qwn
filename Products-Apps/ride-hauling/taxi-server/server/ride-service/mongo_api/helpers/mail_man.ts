import config from '../config/mongo_config';
import nodemailer from 'nodemailer';

interface MailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class SendMail {
  private mailer: typeof nodemailer;
  private settings: any;
  private options: MailOptions;

  constructor(options: MailOptions) {
    this.mailer = nodemailer;
    this.settings = (config as any).mail;
    this.options = options;
  }

  send(): Promise<string> | undefined {
    if (this.mailer && this.options) {
      const transporter = this.mailer.createTransport(this.settings);

      if (transporter !== null) {
        return new Promise((resolve, reject) => {
          transporter.sendMail(this.options, (error: Error | null, info: any) => {
            if (error) {
              reject(new Error('Failed'));
            } else {
              resolve('OK');
            }
          });
        });
      }
    }
  }
}

export default SendMail;
