import { test, expect } from './fixtures/auth.fixture';

test.describe('Ride Booking E2E Flow', () => {
  test('should complete full ride booking flow from request to payment', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to ride booking
    await page.goto('/dashboard');
    await expect(page.locator('text=Book a Ride')).toBeVisible();
    await page.click('button:has-text("Book a Ride")');

    // Step 2: Fill pickup location
    await page.fill('input[placeholder*="pickup"]', 'Lekki Phase 1, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]', { timeout: 5000 });
    await page.click('[data-testid="location-suggestion"]:first-child');

    // Step 3: Fill destination location
    await page.fill('input[placeholder*="destination"]', 'Victoria Island, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]', { timeout: 5000 });
    await page.click('[data-testid="location-suggestion"]:first-child');

    // Step 4: Verify fare estimation is displayed
    await expect(page.locator('[data-testid="fare-estimate"]')).toBeVisible();
    const fareText = await page.locator('[data-testid="fare-estimate"]').textContent();
    expect(fareText).toMatch(/₦|NGN/);

    // Step 5: Select ride type
    await page.click('button:has-text("Fair")'); // Economy option
    await expect(page.locator('text=Fair')).toHaveClass(/selected|active/);

    // Step 6: Request ride
    await page.click('button:has-text("Request Ride")');
    await page.waitForURL(/\/ride\/\w+/, { timeout: 10000 });

    // Step 7: Verify ride details page
    const rideId = page.url().split('/').pop();
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('SEARCHING');
    await expect(page.locator('[data-testid="ride-id"]')).toContainText(rideId);

    // Step 8: Wait for driver acceptance (simulate with mock)
    // In real scenario, this would wait for actual driver acceptance
    await page.waitForTimeout(2000);

    // Step 9: Simulate driver acceptance
    await page.evaluate(() => {
      const event = new CustomEvent('rideAccepted', {
        detail: {
          driver_id: 'driver123',
          driver_name: 'John Driver',
          vehicle_plate: 'ABC-123',
          estimated_fare: 2500,
        },
      });
      window.dispatchEvent(event);
    });

    // Step 10: Verify driver details appear
    await expect(page.locator('[data-testid="driver-name"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=John Driver')).toBeVisible();

    // Step 11: Verify ride status changed to ACCEPTED
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('ACCEPTED');

    // Step 12: Simulate ride started
    await page.evaluate(() => {
      const event = new CustomEvent('rideStarted', {
        detail: { ride_id: 'ride123', status: 'STARTED' },
      });
      window.dispatchEvent(event);
    });

    // Step 13: Verify ride status changed to STARTED
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('STARTED', { timeout: 5000 });

    // Step 14: Simulate ride completed
    await page.evaluate(() => {
      const event = new CustomEvent('rideCompleted', {
        detail: {
          ride_id: 'ride123',
          status: 'COMPLETED',
          fare: 2500,
          local_fare: 2500,
          currency: 'NGN',
        },
      });
      window.dispatchEvent(event);
    });

    // Step 15: Verify ride completion page
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('COMPLETED', { timeout: 5000 });
    await expect(page.locator('[data-testid="final-fare"]')).toBeVisible();

    // Step 16: Verify payment summary
    await expect(page.locator('[data-testid="payment-summary"]')).toBeVisible();
    const finalFare = await page.locator('[data-testid="final-fare"]').textContent();
    expect(finalFare).toMatch(/₦\d+/);

    // Step 17: Submit feedback
    await page.click('button:has-text("Submit Feedback")');
    await page.fill('textarea[placeholder*="feedback"]', 'Great ride experience!');
    await page.click('button:has-text("Submit")');

    // Step 18: Verify feedback submitted
    await expect(page.locator('text=Thank you for your feedback')).toBeVisible({ timeout: 5000 });

    // Step 19: Verify ride appears in history
    await page.goto('/ride-history');
    await expect(page.locator(`text=${rideId}`)).toBeVisible({ timeout: 5000 });
  });

  test('should handle ride cancellation', async ({ page, authenticatedPage }) => {
    // Step 1: Create a ride request
    await page.goto('/dashboard');
    await page.click('button:has-text("Book a Ride")');
    await page.fill('input[placeholder*="pickup"]', 'Lekki Phase 1, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]');
    await page.click('[data-testid="location-suggestion"]:first-child');
    await page.fill('input[placeholder*="destination"]', 'Victoria Island, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]');
    await page.click('[data-testid="location-suggestion"]:first-child');
    await page.click('button:has-text("Request Ride")');
    await page.waitForURL(/\/ride\/\w+/);

    // Step 2: Cancel the ride
    await page.click('button:has-text("Cancel Ride")');
    await page.click('button:has-text("Confirm Cancel")');

    // Step 3: Verify cancellation
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('CANCELLED', { timeout: 5000 });
    await expect(page.locator('text=Ride cancelled')).toBeVisible();
  });

  test('should display surge pricing during high demand', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to ride booking
    await page.goto('/dashboard');
    await page.click('button:has-text("Book a Ride")');

    // Step 2: Fill locations
    await page.fill('input[placeholder*="pickup"]', 'Lekki Phase 1, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]');
    await page.click('[data-testid="location-suggestion"]:first-child');
    await page.fill('input[placeholder*="destination"]', 'Victoria Island, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]');
    await page.click('[data-testid="location-suggestion"]:first-child');

    // Step 3: Simulate surge pricing
    await page.evaluate(() => {
      const event = new CustomEvent('surgePricingActive', {
        detail: { multiplier: 2.5, reason: 'High demand' },
      });
      window.dispatchEvent(event);
    });

    // Step 4: Verify surge pricing displayed
    await expect(page.locator('[data-testid="surge-indicator"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Surge Pricing Active')).toBeVisible();
    await expect(page.locator('text=2.5x')).toBeVisible();

    // Step 5: Verify fare is higher
    const fareWithSurge = await page.locator('[data-testid="fare-estimate"]').textContent();
    expect(fareWithSurge).toMatch(/₦\d+/);
  });

  test('should handle multi-stop rides', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to ride booking
    await page.goto('/dashboard');
    await page.click('button:has-text("Book a Ride")');

    // Step 2: Fill initial locations
    await page.fill('input[placeholder*="pickup"]', 'Lekki Phase 1, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]');
    await page.click('[data-testid="location-suggestion"]:first-child');
    await page.fill('input[placeholder*="destination"]', 'Victoria Island, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]');
    await page.click('[data-testid="location-suggestion"]:first-child');

    // Step 3: Add additional stops
    await page.click('button:has-text("Add Stop")');
    await page.fill('input[placeholder*="stop"]', 'Ikoyi, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]');
    await page.click('[data-testid="location-suggestion"]:first-child');

    // Step 4: Verify multi-stop fare calculation
    await expect(page.locator('[data-testid="fare-estimate"]')).toBeVisible();
    const multiStopFare = await page.locator('[data-testid="fare-estimate"]').textContent();
    expect(multiStopFare).toMatch(/₦\d+/);

    // Step 5: Request multi-stop ride
    await page.click('button:has-text("Request Ride")');
    await page.waitForURL(/\/ride\/\w+/);

    // Step 6: Verify multi-stop ride details
    await expect(page.locator('[data-testid="stop-count"]')).toContainText('2 stops');
  });
});
