import { test as base, expect } from '@playwright/test';

export type AuthFixtures = {
  authenticatedPage: void;
  testDriver: {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
    vehiclePlate: string;
  };
};

export const test = base.extend<AuthFixtures>({
  testDriver: {
    email: 'testdriver@example.com',
    password: 'DriverPassword123!',
    phone: '+234 810 111 1111',
    firstName: 'Test',
    lastName: 'Driver',
    vehiclePlate: 'ABC-123',
  },

  authenticatedPage: async ({ page, testDriver }, use) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('input[type="email"]', testDriver.email);
    await page.fill('input[type="password"]', testDriver.password);

    // Click login button
    await page.click('button:has-text("Login")');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Verify we're logged in
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Use the authenticated page
    await use();

    // Cleanup: logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    await page.waitForURL('/login');
  },
});

export { expect };
