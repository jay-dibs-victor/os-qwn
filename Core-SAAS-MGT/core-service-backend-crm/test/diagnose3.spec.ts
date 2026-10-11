import { Test, TestingModule } from '@nestjs/testing';
import * as path from 'path';

jest.setTimeout(120000);

function loadModule(modName: string, displayName: string) {
  const modPath = path.resolve(__dirname, '..', 'apps', displayName, 'src', modName);
  const mod = require(modPath);
  return mod.default || Object.values(mod).find(
    (v: any) => typeof v === 'function' && v.name?.endsWith('Module')
  );
}

const apps1 = [
  ['rbac-service.module', 'rbac-service'],
  ['reversal-service.module', 'reversal-service'],
  ['wallet-service.module', 'wallet-service'],
];

const apps2 = [
  ['accounts.module', 'accounts-service'],
  ['auth-service.module', 'auth-service'],
  ['ledger-service.module', 'ledger-service'],
  ['payment-service.module', 'payment-service'],
];

describe('load failing services FIRST', () => {
  for (const [modName, displayName] of apps1) {
    it(`loads ${displayName}`, async () => {
      const modClass = loadModule(modName, displayName);
      expect(modClass).toBeDefined();
      const ref = await Test.createTestingModule({ imports: [modClass] }).compile();
      const app = ref.createNestApplication();
      await app.init();
      console.log(`${displayName}: loaded OK`);
      await app.close();
    });
  }
});

describe('load working services SECOND', () => {
  for (const [modName, displayName] of apps2) {
    it(`loads ${displayName}`, async () => {
      const modClass = loadModule(modName, displayName);
      expect(modClass).toBeDefined();
      const ref = await Test.createTestingModule({ imports: [modClass] }).compile();
      const app = ref.createNestApplication();
      await app.init();
      console.log(`${displayName}: loaded OK`);
      await app.close();
    });
  }
});
