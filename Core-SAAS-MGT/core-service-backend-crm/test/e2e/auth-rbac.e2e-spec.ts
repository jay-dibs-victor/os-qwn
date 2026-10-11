/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars */
import axios from 'axios';

describe.skip('Auth & RBAC E2E', () => {
  const GATEWAY_URL = 'http://localhost:3000';
  const tenantId = 'SYSTEM';
  let accessToken: string;
  let userId: string;

  it('should register a new user', async () => {
    const response = await axios.post(`${GATEWAY_URL}/auth/register`, {
      email: `test-${Date.now()}@example.com`,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      phone: `+23480${Date.now().toString().slice(-8)}`,
      tenantId,
    });

    expect(response.status).toBe(201);
    expect(response.data.id).toBeDefined();
    userId = response.data.id;

    // Verify account
    await axios.post(`${GATEWAY_URL}/auth/verify-account`, { userId });
  });

  it('should login and return a JWT without permissions initially', async () => {
    const response = await axios.post(
      `${GATEWAY_URL}/auth/login`,
      {
        email: `test-${Date.now()}@example.com`,
        password: 'Password123!',
      },
      {

      },
    );

  });

  // Re-writing with a cleaner flow...
});
