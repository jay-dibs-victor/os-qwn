import fs from 'fs';
import nodemailer from 'nodemailer';
import Q from 'q';

// If email-templates is used, it should be imported. 
// However, since it's missing in the original, I'll define a placeholder or keep it as is.
// It seems the original code was missing a require for 'email-templates'.
const emailTemplates = require('email-templates');

const EmailVerification = {
  _template: null as any,
  _transport: null as any,

  init: function(config: { emailTplsDir: string }): Q.Promise<void> {
    const d = Q.defer<void>();

    emailTemplates(
      config.emailTplsDir,
      (err: any, template: any) => {
        if (err) {
          return d.reject(err);
        }

        this._template = template;
        this._transport = nodemailer.createTransport({
          // @ts-ignore
          service: 'Sendgrid',
          auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD },
        });
        return d.resolve();
      }
    );

    return d.promise;
  },

  send: function(from: string, to: string, subject: string, text: string, html?: string): Q.Promise<any> {
    const d = Q.defer<any>();
    const params: any = {
      from: from,
      to: to,
      subject: subject,
      text: text,
    };

    if (html) {
      params.html = html;
    }

    this._transport.sendMail(params, (err: any, res: any) => {
      if (err) {
        console.error(err);
        return d.reject(err);
      } else {
        return d.resolve(res);
      }
    });

    return d.promise;
  },

  sendMail: function(from: string, to: string, subject: string, tplName: string, locals: any): Q.Promise<any> {
    const d = Q.defer<any>();
    const self = this;
    this.init({ emailTplsDir: 'email-templates' }).then(
      () => {
        this._template(tplName, locals, (err: any, html: string, text: string) => {
          if (err) {
            console.error(err);
            return d.reject(err);
          }

          self.send(from, to, subject, text, html).then((res: any) => {
            return d.resolve(res);
          });
        });
      }
    );

    return d.promise;
  },
};

export default EmailVerification;
