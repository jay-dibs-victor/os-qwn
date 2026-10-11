import { Test } from '@nestjs/testing';
import { getConnectionManager } from 'typeorm';

jest.setTimeout(60000);

describe('diagnose rbac after other modules', () => {
  it('loads rbac after auth has been loaded', async () => {
    // First load auth-service (known to work)
    const authMod = require('../apps/auth-service/src/auth-service.module').AuthServiceModule;
    const authRef = await Test.createTestingModule({ imports: [authMod] }).compile();
    const authApp = authRef.createNestApplication();
    await authApp.init();
    console.log('AUTH: loaded OK');

    // Check if there's an existing connection
    const cm = getConnectionManager();
    console.log('Connections after auth:', cm.has('default') ? 'default exists' : 'no default');

    await authApp.close();
    console.log('Connections after auth close:', cm.has('default') ? 'default still exists' : 'no default');

    // Now try to load rbac
    try {
      const rbacMod = require('../apps/rbac-service/src/rbac-service.module').RbacServiceModule;
      const rbacRef = await Test.createTestingModule({ imports: [rbacMod] }).compile();
      const rbacApp = rbacRef.createNestApplication();
      await rbacApp.init();
      console.log('RBAC after auth: OK');
      await rbacApp.close();
    } catch (e: any) {
      console.log('RBAC after auth: FAIL -', e.message);
      console.log(e.stack?.split('\n').slice(0, 10).join('\n'));
    }
  });
});
