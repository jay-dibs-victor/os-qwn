import axios from 'axios';

/**
 * SmsService — Courier Dispatch MVP
 * Handles SMS fallbacks for critical delivery updates in Nigeria.
 * Supports Termii, Twilio, or generic SMTP-to-SMS.
 */
export class SmsService {
  private static API_KEY = process.env.TERMII_API_KEY || 'mock_key';
  private static BASE_URL = 'https://api.ng.termii.com/api';

  /**
   * Send a delivery update SMS
   */
  static async sendUpdate(phone: string, message: string) {
    if (process.env.NODE_ENV === 'development' || this.API_KEY === 'mock_key') {
      console.log(`[SMS MOCK] To: ${phone} | Content: ${message}`);
      return true;
    }

    try {
      const payload = {
        to: phone,
        from: 'Queens',
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: this.API_KEY,
      };

      await axios.post(`${this.BASE_URL}/sms/send`, payload);
      return true;
    } catch (e) {
      console.error('[SmsService] Failed to send SMS:', e);
      return false;
    }
  }

  /**
   * Send OTP for delivery confirmation
   */
  static async sendOtp(phone: string, code: string) {
    const message = `Your Queens delivery OTP is: ${code}. Please provide this to the rider only when you have received your package.`;
    return await this.sendUpdate(phone, message);
  }
}
