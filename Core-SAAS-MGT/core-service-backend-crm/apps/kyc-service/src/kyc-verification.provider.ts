import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class KycVerificationProvider {
  hashIdentifier(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  async verifyBvn(_bvn: string): Promise<boolean> {
    // TODO: integrate with BVN verification service
    return true;
  }

  async verifyNin(_nin: string): Promise<boolean> {
    // TODO: integrate with NIN verification service
    return true;
  }
}
