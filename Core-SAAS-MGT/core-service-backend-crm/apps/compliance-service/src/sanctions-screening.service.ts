import { Injectable } from '@nestjs/common';

@Injectable()
export class SanctionsScreeningService {
  async screen(_name: string): Promise<{ hit: boolean; matches: string[] }> {
    // TODO: integrate with sanctions screening API (e.g. OFAC, UN Sanctions)
    return { hit: false, matches: [] };
  }
}
