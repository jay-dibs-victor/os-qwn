import { test, expect } from './fixtures/auth.fixture';

test.describe('Driver Courier Request E2E Flow', () => {
  test('should accept and complete courier delivery', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('text=Available Requests')).toBeVisible();

    // Step 2: Verify driver is online
    await expect(page.locator('[data-testid="driver-status"]')).toContainText('ONLINE');

    // Step 3: Simulate incoming courier request
    await page.evaluate(() => {
      const event = new CustomEvent('courierRequested', {
        detail: {
          shipment_id: 'shipment_001',
          sender_name: 'John Sender',
          recipient_name: 'Jane Recipient',
          pickup_location: 'Lekki Phase 1, Lagos',
          dropoff_location: 'Victoria Island, Lagos',
          package_type: 'small',
          weight: 2.5,
          estimated_fare: 1500,
          distance: 5.2,
          duration: 15
        }
      });
      window.dispatchEvent(event);
    });

    // Step 4: Verify courier request notification appears
    await expect(page.locator('[data-testid="courier-request-notification"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=New Courier Request')).toBeVisible();

    // Step 5: Verify shipment details in notification
    await expect(page.locator('text=John Sender')).toBeVisible();
    await expect(page.locator('text=Jane Recipient')).toBeVisible();
    await expect(page.locator('text=Lekki Phase 1')).toBeVisible();

    // Step 6: Accept courier request
    await page.click('button:has-text("Accept")');

    // Step 7: Verify request accepted
    await page.waitForURL(/\/courier\/\w+/, { timeout: 10000 });
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('ACCEPTED');

    // Step 8: Verify shipment details page
    const shipmentId = page.url().split('/').pop();
    await expect(page.locator('[data-testid="shipment-id"]')).toContainText(shipmentId);

    // Step 9: Verify sender and recipient info
    await expect(page.locator('[data-testid="sender-name"]')).toContainText('John Sender');
    await expect(page.locator('[data-testid="recipient-name"]')).toContainText('Jane Recipient');

    // Step 10: Verify pickup and dropoff locations
    await expect(page.locator('[data-testid="pickup-address"]')).toContainText('Lekki Phase 1');
    await expect(page.locator('[data-testid="dropoff-address"]')).toContainText('Victoria Island');

    // Step 11: Verify package details
    await expect(page.locator('[data-testid="package-type"]')).toContainText('Small Package');
    await expect(page.locator('[data-testid="package-weight"]')).toContainText('2.5');

    // Step 12: Verify fare estimate
    const fareText = await page.locator('[data-testid="fare-estimate"]').textContent();
    expect(fareText).toMatch(/₦\d+/);

    // Step 13: Simulate driver arriving at pickup
    await page.click('button:has-text("Arrived at Pickup")');

    // Step 14: Verify status updated
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('ARRIVED_PICKUP', { timeout: 5000 });

    // Step 15: Pickup package
    await page.click('button:has-text("Package Picked Up")');

    // Step 16: Verify in-transit status
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('IN_TRANSIT', { timeout: 5000 });

    // Step 17: Verify live tracking active
    await expect(page.locator('[data-testid="live-tracking"]')).toBeVisible();

    // Step 18: Simulate driver arriving at dropoff
    await page.click('button:has-text("Arrived at Dropoff")');

    // Step 19: Verify arrival status
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('ARRIVED_DROPOFF', { timeout: 5000 });

    // Step 20: Verify delivery proof form appears
    await expect(page.locator('[data-testid="delivery-proof-form"]')).toBeVisible();

    // Step 21: Upload delivery photo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/delivery-photo.jpg');
    await page.waitForTimeout(1000);

    // Step 22: Enter OTP
    await page.fill('input[placeholder*="OTP"]', '123456');

    // Step 23: Submit delivery proof
    await page.click('button:has-text("Confirm Delivery")');

    // Step 24: Verify delivery completed
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('DELIVERED', { timeout: 5000 });

    // Step 25: Verify delivery summary
    await expect(page.locator('[data-testid="delivery-summary"]')).toBeVisible();

    // Step 26: Verify earnings
    await expect(page.locator('[data-testid="earnings"]')).toBeVisible();
    const earningsText = await page.locator('[data-testid="earnings"]').textContent();
    expect(earningsText).toMatch(/₦\d+/);

    // Step 27: Rate delivery
    await page.click('button:has-text("Rate Delivery")');
    await page.click('[data-testid="star-5"]'); // 5-star rating
    await page.fill('textarea[placeholder*="feedback"]', 'Smooth delivery!');
    await page.click('button:has-text("Submit Rating")');

    // Step 28: Verify rating submitted
    await expect(page.locator('text=Thank you for your rating')).toBeVisible({ timeout: 5000 });

    // Step 29: Verify shipment appears in history
    await page.goto('/courier-history');
    await expect(page.locator(`text=${shipmentId}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=DELIVERED')).toBeVisible();
  });

  test('should handle multi-stop courier deliveries', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');

    // Step 2: Simulate multi-stop courier request
    await page.evaluate(() => {
      const event = new CustomEvent('courierRequested', {
        detail: {
          shipment_id: 'shipment_multistop_001',
          sender_name: 'Multi Sender',
          stops: [
            { recipient_name: 'Stop 1 Recipient', location: 'Victoria Island, Lagos', order: 1 },
            { recipient_name: 'Stop 2 Recipient', location: 'Ikoyi, Lagos', order: 2 }
          ],
          pickup_location: 'Lekki Phase 1, Lagos',
          package_type: 'medium',
          weight: 5,
          estimated_fare: 2500,
          stop_count: 2
        }
      });
      window.dispatchEvent(event);
    });

    // Step 3: Accept multi-stop courier request
    await expect(page.locator('[data-testid="courier-request-notification"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=2 stops')).toBeVisible();
    await page.click('button:has-text("Accept")');
    await page.waitForURL(/\/courier\/\w+/, { timeout: 10000 });

    // Step 4: Verify multi-stop details
    await expect(page.locator('[data-testid="stop-count"]')).toContainText('2 stops');

    // Step 5: Pickup package
    await page.click('button:has-text("Arrived at Pickup")');
    await page.click('button:has-text("Package Picked Up")');

    // Step 6: Verify in-transit
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('IN_TRANSIT', { timeout: 5000 });

    // Step 7: Arrive at first stop
    await page.click('button:has-text("Arrived at Stop 1")');

    // Step 8: Verify delivery proof for stop 1
    await expect(page.locator('[data-testid="delivery-proof-form"]')).toBeVisible({ timeout: 5000 });

    // Step 9: Upload photo for stop 1
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/delivery-photo.jpg');
    await page.fill('input[placeholder*="OTP"]', '111111');
    await page.click('button:has-text("Confirm Delivery")');

    // Step 10: Verify stop 1 completed
    await expect(page.locator('[data-testid="stop-1-status"]')).toContainText('DELIVERED', { timeout: 5000 });

    // Step 11: Arrive at second stop
    await page.click('button:has-text("Arrived at Stop 2")');

    // Step 12: Verify delivery proof for stop 2
    await expect(page.locator('[data-testid="delivery-proof-form"]')).toBeVisible({ timeout: 5000 });

    // Step 13: Upload photo for stop 2
    await fileInput.setInputFiles('./tests/fixtures/delivery-photo.jpg');
    await page.fill('input[placeholder*="OTP"]', '222222');
    await page.click('button:has-text("Confirm Delivery")');

    // Step 14: Verify stop 2 completed
    await expect(page.locator('[data-testid="stop-2-status"]')).toContainText('DELIVERED', { timeout: 5000 });

    // Step 15: Verify shipment completed
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('DELIVERED', { timeout: 5000 });
  });

  test('should handle courier cancellation', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');

    // Step 2: Simulate incoming courier request
    await page.evaluate(() => {
      const event = new CustomEvent('courierRequested', {
        detail: {
          shipment_id: 'shipment_cancel_001',
          sender_name: 'Cancel Sender',
          recipient_name: 'Cancel Recipient',
          pickup_location: 'Lekki Phase 1, Lagos',
          dropoff_location: 'Victoria Island, Lagos',
          package_type: 'small',
          weight: 2,
          estimated_fare: 1200
        }
      });
      window.dispatchEvent(event);
    });

    // Step 3: Accept courier request
    await expect(page.locator('[data-testid="courier-request-notification"]')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("Accept")');
    await page.waitForURL(/\/courier\/\w+/, { timeout: 10000 });

    // Step 4: Cancel shipment
    await page.click('button:has-text("Cancel Shipment")');
    await page.click('button:has-text("Confirm Cancel")');

    // Step 5: Verify cancellation
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('CANCELLED', { timeout: 5000 });
    await expect(page.locator('text=Shipment cancelled')).toBeVisible();
  });

  test('should display delivery proof submission', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');

    // Step 2: Simulate courier request
    await page.evaluate(() => {
      const event = new CustomEvent('courierRequested', {
        detail: {
          shipment_id: 'shipment_proof_001',
          sender_name: 'Proof Sender',
          recipient_name: 'Proof Recipient',
          pickup_location: 'Lekki Phase 1, Lagos',
          dropoff_location: 'Victoria Island, Lagos',
          package_type: 'small',
          weight: 2,
          estimated_fare: 1500
        }
      });
      window.dispatchEvent(event);
    });

    // Step 3: Accept and navigate to delivery
    await expect(page.locator('[data-testid="courier-request-notification"]')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("Accept")');
    await page.waitForURL(/\/courier\/\w+/, { timeout: 10000 });

    // Step 4: Complete pickup
    await page.click('button:has-text("Arrived at Pickup")');
    await page.click('button:has-text("Package Picked Up")');

    // Step 5: Arrive at dropoff
    await page.click('button:has-text("Arrived at Dropoff")');

    // Step 6: Verify delivery proof form
    await expect(page.locator('[data-testid="delivery-proof-form"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Upload Delivery Photo')).toBeVisible();
    await expect(page.locator('text=Enter OTP')).toBeVisible();

    // Step 7: Verify form fields
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="OTP"]')).toBeVisible();
    await expect(page.locator('button:has-text("Confirm Delivery")')).toBeVisible();

    // Step 8: Verify recipient info visible
    await expect(page.locator('[data-testid="recipient-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="recipient-phone"]')).toBeVisible();
  });

  test('should display courier earnings and history', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to earnings page
    await page.goto('/earnings');

    // Step 2: Verify earnings page
    await expect(page.locator('text=Earnings')).toBeVisible();

    // Step 3: Verify total earnings display
    await expect(page.locator('[data-testid="total-earnings"]')).toBeVisible();
    const earningsText = await page.locator('[data-testid="total-earnings"]').textContent();
    expect(earningsText).toMatch(/₦\d+/);

    // Step 4: Verify earnings breakdown
    await expect(page.locator('[data-testid="rides-earnings"]')).toBeVisible();
    await expect(page.locator('[data-testid="courier-earnings"]')).toBeVisible();

    // Step 5: Navigate to courier history
    await page.goto('/courier-history');

    // Step 6: Verify courier history page
    await expect(page.locator('text=Courier History')).toBeVisible();

    // Step 7: Verify delivery list
    await expect(page.locator('[data-testid="delivery-list"]')).toBeVisible();

    // Step 8: Verify delivery entries
    await expect(page.locator('[data-testid="delivery-item"]')).toHaveCount(3, { timeout: 5000 });

    // Step 9: Verify delivery details
    await expect(page.locator('[data-testid="delivery-recipient"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivery-location"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivery-earnings"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivery-date"]')).toBeVisible();

    // Step 10: Click on a delivery to view details
    await page.click('[data-testid="delivery-item"]:first-child');

    // Step 11: Verify delivery detail view
    await expect(page.locator('[data-testid="delivery-detail"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="shipment-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivery-proof"]')).toBeVisible();
  });

  test('should handle live tracking during delivery', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to dashboard
    await page.goto('/dashboard');

    // Step 2: Simulate courier request
    await page.evaluate(() => {
      const event = new CustomEvent('courierRequested', {
        detail: {
          shipment_id: 'shipment_tracking_001',
          sender_name: 'Tracking Sender',
          recipient_name: 'Tracking Recipient',
          pickup_location: 'Lekki Phase 1, Lagos',
          dropoff_location: 'Victoria Island, Lagos',
          package_type: 'small',
          weight: 2,
          estimated_fare: 1500
        }
      });
      window.dispatchEvent(event);
    });

    // Step 3: Accept and start delivery
    await expect(page.locator('[data-testid="courier-request-notification"]')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("Accept")');
    await page.waitForURL(/\/courier\/\w+/, { timeout: 10000 });

    // Step 4: Complete pickup
    await page.click('button:has-text("Arrived at Pickup")');
    await page.click('button:has-text("Package Picked Up")');

    // Step 5: Verify live tracking active
    await expect(page.locator('[data-testid="live-tracking"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible();

    // Step 6: Verify driver location on map
    await expect(page.locator('[data-testid="driver-marker"]')).toBeVisible();

    // Step 7: Verify destination marker
    await expect(page.locator('[data-testid="destination-marker"]')).toBeVisible();

    // Step 8: Verify route displayed
    await expect(page.locator('[data-testid="route-polyline"]')).toBeVisible();

    // Step 9: Verify distance and time remaining
    await expect(page.locator('[data-testid="distance-remaining"]')).toBeVisible();
    await expect(page.locator('[data-testid="time-remaining"]')).toBeVisible();

    // Step 10: Verify recipient contact info visible
    await expect(page.locator('[data-testid="recipient-phone"]')).toBeVisible();
    await expect(page.locator('button:has-text("Call Recipient")')).toBeVisible();
  });
});
