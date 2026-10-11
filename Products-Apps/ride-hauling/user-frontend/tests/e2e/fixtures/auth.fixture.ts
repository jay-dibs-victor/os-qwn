import { test as base, expect } from '@playwright/test';

export type AuthFixtures = {
  authenticatedPage: void;
  testUser: {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
};

export const test = base.extend<AuthFixtures>({
  testUser: {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    phone: '+234 810 000 0000',
    firstName: 'Test',
    lastName: 'User',
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);

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
