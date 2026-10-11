import { test, expect } from './fixtures/auth.fixture';

test.describe('Driver Ride Dispatch E2E Flow', () => {
  test('should accept and complete ride dispatch', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('text=Available Rides')).toBeVisible();

    // Step 2: Verify driver is online
    await expect(page.locator('[data-testid="driver-status"]')).toContainText('ONLINE');

    // Step 3: Simulate incoming ride request
    await page.evaluate(() => {
      const event = new CustomEvent('rideRequested', {
        detail: {
          ride_id: 'ride_driver_001',
          user_name: 'John User',
          pickup_location: 'Lekki Phase 1, Lagos',
          dropoff_location: 'Victoria Island, Lagos',
          estimated_fare: 2500,
          distance: 5.2,
          duration: 15,
          user_rating: 4.8
        }
      });
      window.dispatchEvent(event);
    });

    // Step 4: Verify ride request notification appears
    await expect(page.locator('[data-testid="ride-request-notification"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=New Ride Request')).toBeVisible();

    // Step 5: Verify ride details in notification
    await expect(page.locator('text=John User')).toBeVisible();
    await expect(page.locator('text=Lekki Phase 1')).toBeVisible();
    await expect(page.locator('text=Victoria Island')).toBeVisible();

    // Step 6: Accept ride request
    await page.click('button:has-text("Accept")');

    // Step 7: Verify ride accepted
    await page.waitForURL(/\/ride\/\w+/, { timeout: 10000 });
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('ACCEPTED');

    // Step 8: Verify ride details page
    const rideId = page.url().split('/').pop();
    await expect(page.locator('[data-testid="ride-id"]')).toContainText(rideId);
    await expect(page.locator('[data-testid="passenger-name"]')).toContainText('John User');

    // Step 9: Verify pickup location
    await expect(page.locator('[data-testid="pickup-address"]')).toContainText('Lekki Phase 1');

    // Step 10: Verify dropoff location
    await expect(page.locator('[data-testid="dropoff-address"]')).toContainText('Victoria Island');

    // Step 11: Verify fare estimate
    const fareText = await page.locator('[data-testid="fare-estimate"]').textContent();
    expect(fareText).toMatch(/₦\d+/);

    // Step 12: Simulate driver arriving at pickup
    await page.click('button:has-text("Arrived at Pickup")');

    // Step 13: Verify status updated
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('ARRIVED', { timeout: 5000 });

    // Step 14: Simulate passenger pickup
    await page.click('button:has-text("Passenger Picked Up")');

    // Step 15: Verify ride started
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('STARTED', { timeout: 5000 });

    // Step 16: Verify live tracking active
    await expect(page.locator('[data-testid="live-tracking"]')).toBeVisible();

    // Step 17: Simulate driver arriving at destination
    await page.click('button:has-text("Arrived at Destination")');

    // Step 18: Verify arrival status
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('ARRIVED_DESTINATION', { timeout: 5000 });

    // Step 19: Complete ride
    await page.click('button:has-text("Complete Ride")');

    // Step 20: Verify ride completed
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('COMPLETED', { timeout: 5000 });

    // Step 21: Verify final fare
    await expect(page.locator('[data-testid="final-fare"]')).toBeVisible();
    const finalFare = await page.locator('[data-testid="final-fare"]').textContent();
    expect(finalFare).toMatch(/₦\d+/);

    // Step 22: Verify earnings summary
    await expect(page.locator('[data-testid="earnings-summary"]')).toBeVisible();

    // Step 23: Rate passenger
    await page.click('button:has-text("Rate Passenger")');
    await page.click('[data-testid="star-5"]'); // 5-star rating
    await page.fill('textarea[placeholder*="feedback"]', 'Great passenger!');
    await page.click('button:has-text("Submit Rating")');

    // Step 24: Verify rating submitted
    await expect(page.locator('text=Thank you for your rating')).toBeVisible({ timeout: 5000 });

    // Step 25: Verify ride appears in history
    await page.goto('/ride-history');
    await expect(page.locator(`text=${rideId}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=COMPLETED')).toBeVisible();
  });

  test('should handle ride cancellation by driver', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');

    // Step 2: Simulate incoming ride request
    await page.evaluate(() => {
      const event = new CustomEvent('rideRequested', {
        detail: {
          ride_id: 'ride_cancel_001',
          user_name: 'Jane User',
          pickup_location: 'Lekki Phase 1, Lagos',
          dropoff_location: 'Victoria Island, Lagos',
          estimated_fare: 2500
        }
      });
      window.dispatchEvent(event);
    });

    // Step 3: Accept ride
    await expect(page.locator('[data-testid="ride-request-notification"]')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("Accept")');
    await page.waitForURL(/\/ride\/\w+/, { timeout: 10000 });

    // Step 4: Cancel ride
    await page.click('button:has-text("Cancel Ride")');
    await page.click('button:has-text("Confirm Cancel")');

    // Step 5: Verify cancellation
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('CANCELLED', { timeout: 5000 });
    await expect(page.locator('text=Ride cancelled')).toBeVisible();
  });

  test('should display ride tracking with live location', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');

    // Step 2: Simulate incoming ride
    await page.evaluate(() => {
      const event = new CustomEvent('rideRequested', {
        detail: {
          ride_id: 'ride_tracking_001',
          user_name: 'Test User',
          pickup_location: 'Lekki Phase 1, Lagos',
          dropoff_location: 'Victoria Island, Lagos',
          estimated_fare: 2500
        }
      });
      window.dispatchEvent(event);
    });

    // Step 3: Accept ride
    await expect(page.locator('[data-testid="ride-request-notification"]')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("Accept")');
    await page.waitForURL(/\/ride\/\w+/, { timeout: 10000 });

    // Step 4: Start ride
    await page.click('button:has-text("Arrived at Pickup")');
    await page.click('button:has-text("Passenger Picked Up")');

    // Step 5: Verify live tracking
    await expect(page.locator('[data-testid="live-tracking"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible();

    // Step 6: Verify driver location on map
    await expect(page.locator('[data-testid="driver-marker"]')).toBeVisible();

    // Step 7: Verify passenger location on map
    await expect(page.locator('[data-testid="passenger-marker"]')).toBeVisible();

    // Step 8: Verify route displayed
    await expect(page.locator('[data-testid="route-polyline"]')).toBeVisible();

    // Step 9: Verify distance and time remaining
    await expect(page.locator('[data-testid="distance-remaining"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-remaining"]')).toBeVisible();
  });

  test('should handle surge pricing display', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');

    // Step 2: Simulate surge pricing event
    await page.evaluate(() => {
      const event = new CustomEvent('surgePricingActive', {
        detail: {
          multiplier: 2.5,
          reason: 'High demand'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 3: Verify surge pricing indicator
    await expect(page.locator('[data-testid="surge-indicator"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Surge Pricing Active')).toBeVisible();
    await expect(page.locator('text=2.5x')).toBeVisible();

    // Step 4: Simulate incoming ride during surge
    await page.evaluate(() => {
      const event = new CustomEvent('rideRequested', {
        detail: {
          ride_id: 'ride_surge_001',
          user_name: 'Surge User',
          pickup_location: 'Lekki Phase 1, Lagos',
          dropoff_location: 'Victoria Island, Lagos',
          estimated_fare: 6250, // 2500 * 2.5
          surge_multiplier: 2.5
        }
      });
      window.dispatchEvent(event);
    });

    // Step 5: Verify surge pricing in ride request
    await expect(page.locator('[data-testid="ride-request-notification"]')).toBeVisible({ timeout: 5000 });
    const fareText = await page.locator('[data-testid="surge-fare"]').textContent();
    expect(fareText).toMatch(/₦6,250/);
  });

  test('should handle multi-stop rides', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');

    // Step 2: Simulate multi-stop ride request
    await page.evaluate(() => {
      const event = new CustomEvent('rideRequested', {
        detail: {
          ride_id: 'ride_multistop_001',
          user_name: 'Multi User',
          pickup_location: 'Lekki Phase 1, Lagos',
          stops: [
            { location: 'Victoria Island, Lagos', order: 1 },
            { location: 'Ikoyi, Lagos', order: 2 }
          ],
          estimated_fare: 4500,
          stop_count: 2
        }
      });
      window.dispatchEvent(event);
    });

    // Step 3: Accept multi-stop ride
    await expect(page.locator('[data-testid="ride-request-notification"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=2 stops')).toBeVisible();
    await page.click('button:has-text("Accept")');
    await page.waitForURL(/\/ride\/\w+/, { timeout: 10000 });

    // Step 4: Verify multi-stop details
    await expect(page.locator('[data-testid="stop-count"]')).toContainText('2 stops');

    // Step 5: Complete first stop
    await page.click('button:has-text("Arrived at Pickup")');
    await page.click('button:has-text("Passenger Picked Up")');
    await page.click('button:has-text("Arrived at Stop 1")');
    await page.click('button:has-text("Passenger Dropped at Stop 1")');

    // Step 6: Verify first stop completed
    await expect(page.locator('[data-testid="stop-1-status"]')).toContainText('COMPLETED', { timeout: 5000 });

    // Step 7: Complete second stop
    await page.click('button:has-text("Arrived at Stop 2")');
    await page.click('button:has-text("Passenger Dropped at Stop 2")');

    // Step 8: Verify second stop completed
    await expect(page.locator('[data-testid="stop-2-status"]')).toContainText('COMPLETED', { timeout: 5000 });

    // Step 9: Complete ride
    await page.click('button:has-text("Complete Ride")');

    // Step 10: Verify ride completed
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('COMPLETED', { timeout: 5000 });
  });
});
