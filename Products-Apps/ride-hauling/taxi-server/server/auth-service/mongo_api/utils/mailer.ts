import nodemailer from 'nodemailer';
import debug from 'debug';

interface MailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 *@description - A function for sending mail
 *
 * @param {MailData} mailData Mail Details
 *
 * @returns {Promise<void>} Promise<void>
 */
const mailer = async (mailData: MailData): Promise<void> => {
  const { to, subject, text, html } = mailData;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: '"Banka App " <tejumoladavid@gmail.com>',
      to,
      subject,
      text,
      html,
    });

    debug('development')('Message sent: %s', info.messageId);
    debug('development')('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    debug('development')(err);
  }
};

export default mailer;
