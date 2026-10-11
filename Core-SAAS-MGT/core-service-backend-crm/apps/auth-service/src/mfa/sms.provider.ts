export abstract class SmsProvider {
  abstract send(phone: string, message: string): Promise<void>;
}

export class StubSmsProvider implements SmsProvider {
  send(phone: string, message: string): Promise<void> {
    console.log(`[SMS STUB] To: ${phone} | Message: ${message}`);
    return Promise.resolve();
  }
}

export const SMS_PROVIDER = 'SMS_PROVIDER';
