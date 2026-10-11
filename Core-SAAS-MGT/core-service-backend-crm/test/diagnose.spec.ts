import { Test } from '@nestjs/testing';

jest.setTimeout(30000);

describe('diagnose rbac load failure', () => {
  it('loads rbac service and captures full error', async () => {
    try {
      const mod = require('../apps/rbac-service/src/rbac-service.module');
      const cls = mod.RbacServiceModule;
      await Test.createTestingModule({ imports: [cls] }).compile();
      console.log('RBAC: OK');
    } catch (e: any) {
      console.log('ERROR:', e.message);
      console.log('STACK:', e.stack?.split('\n').slice(0, 15).join('\n'));
      // Don't fail the test - just report
    }

    try {
      const mod = require('../apps/reversal-service/src/reversal-service.module');
      const cls = mod.ReversalServiceModule;
      await Test.createTestingModule({ imports: [cls] }).compile();
      console.log('REVERSAL: OK');
    } catch (e: any) {
      console.log('ERROR:', e.message);
      console.log('STACK:', e.stack?.split('\n').slice(0, 15).join('\n'));
    }

    try {
      const mod = require('../apps/wallet-service/src/wallet-service.module');
      const cls = mod.WalletServiceModule;
      await Test.createTestingModule({ imports: [cls] }).compile();
      console.log('WALLET: OK');
    } catch (e: any) {
      console.log('ERROR:', e.message);
      console.log('STACK:', e.stack?.split('\n').slice(0, 15).join('\n'));
    }
  });
});
