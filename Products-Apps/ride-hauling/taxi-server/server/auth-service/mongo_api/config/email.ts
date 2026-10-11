import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const GmailTransport = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.google.com',
  port: 587,
  auth: {
    user: 'juwavictor@gmail.com',
    pass: 'saladin123!@#9999320392dsdjseuw823829',
  },
});

export const SMTPTransport = nodemailer.createTransport({
  host: 'mail.softclo.com',
  port: 587,
  secure: false,
  // debug: true,
  auth: {
    user: 'tester@softclo.com',
    pass: 'Tester@123',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const ViewOption = (transport: any, hbs: any) => {
  transport.use(
    'compile',
    hbs({
      viewPath: 'views/email',
      extName: '.hbs',
    }),
  );
};

export default {
  GmailTransport,
  SMTPTransport,
  ViewOption,
};
