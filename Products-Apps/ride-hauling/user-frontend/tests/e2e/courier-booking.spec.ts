import { test, expect } from './fixtures/auth.fixture';

test.describe('Courier Service E2E Flow', () => {
  test('should complete full courier flow from creation to delivery', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to courier service
    await page.goto('/dashboard');
    await expect(page.locator('text=Send a Package')).toBeVisible();
    await page.click('button:has-text("Send a Package")');

    // Step 2: Verify courier landing page
    await page.waitForURL(/\/courier/, { timeout: 5000 });
    await expect(page.locator('text=Create Shipment')).toBeVisible();
    await page.click('button:has-text("Create Shipment")');

    // Step 3: Select package type
    await page.waitForSelector('[data-testid="package-type-selector"]', { timeout: 5000 });
    await page.click('button:has-text("Small Package")');
    await expect(page.locator('text=Small Package')).toHaveClass(/selected|active/);

    // Step 4: Fill package details
    await page.fill('input[placeholder*="weight"]', '2.5');
    await page.fill('textarea[placeholder*="description"]', 'Important documents for delivery');
    await page.fill('input[placeholder*="value"]', '500');

    // Step 5: Select pickup location on map
    await page.click('button:has-text("Select Pickup Location")');
    await page.waitForSelector('[data-testid="map-container"]', { timeout: 5000 });
    
    // Simulate map click for pickup
    await page.evaluate(() => {
      const event = new CustomEvent('mapLocationSelected', {
        detail: {
          lat: 6.5244,
          lng: 3.3792,
          address: 'Lekki Phase 1, Lagos'
        }
      });
      window.dispatchEvent(event);
    });

    await expect(page.locator('text=Lekki Phase 1, Lagos')).toBeVisible({ timeout: 5000 });

    // Step 6: Select dropoff location on map
    await page.click('button:has-text("Select Dropoff Location")');
    await page.waitForSelector('[data-testid="map-container"]', { timeout: 5000 });
    
    // Simulate map click for dropoff
    await page.evaluate(() => {
      const event = new CustomEvent('mapLocationSelected', {
        detail: {
          lat: 6.4344,
          lng: 3.4367,
          address: 'Victoria Island, Lagos'
        }
      });
      window.dispatchEvent(event);
    });

    await expect(page.locator('text=Victoria Island, Lagos')).toBeVisible({ timeout: 5000 });

    // Step 7: Fill recipient details
    await page.fill('input[placeholder*="recipient name"]', 'John Recipient');
    await page.fill('input[placeholder*="recipient phone"]', '+234 810 000 0001');
    await page.fill('input[placeholder*="recipient email"]', 'recipient@example.com');

    // Step 8: Add special instructions
    await page.fill('textarea[placeholder*="special instructions"]', 'Please ring doorbell twice');

    // Step 9: Request quote
    await page.click('button:has-text("Get Quote")');
    await page.waitForSelector('[data-testid="quote-summary"]', { timeout: 5000 });

    // Step 10: Verify quote is displayed with currency
    await expect(page.locator('[data-testid="quote-summary"]')).toBeVisible();
    const quoteText = await page.locator('[data-testid="quote-price"]').textContent();
    expect(quoteText).toMatch(/₦|NGN/);

    // Step 11: Verify quote breakdown
    await expect(page.locator('[data-testid="base-fare"]')).toBeVisible();
    await expect(page.locator('[data-testid="distance-charge"]')).toBeVisible();
    await expect(page.locator('[data-testid="package-surcharge"]')).toBeVisible();

    // Step 12: Select payment method
    await page.click('button:has-text("Wallet")');
    await expect(page.locator('text=Wallet')).toHaveClass(/selected|active/);

    // Step 13: Confirm and create shipment
    await page.click('button:has-text("Confirm & Create Shipment")');
    await page.waitForURL(/\/courier\/tracking\/\w+/, { timeout: 10000 });

    // Step 14: Verify shipment created and tracking page displayed
    const trackingId = page.url().split('/').pop();
    await expect(page.locator('[data-testid="tracking-id"]')).toContainText(trackingId);
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('PENDING');

    // Step 15: Verify shipment details
    await expect(page.locator('[data-testid="pickup-address"]')).toContainText('Lekki Phase 1');
    await expect(page.locator('[data-testid="dropoff-address"]')).toContainText('Victoria Island');
    await expect(page.locator('[data-testid="recipient-name"]')).toContainText('John Recipient');

    // Step 16: Simulate driver acceptance
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('shipmentAccepted', {
        detail: {
          driver_id: 'driver456',
          driver_name: 'Ahmed Driver',
          vehicle_plate: 'XYZ-789',
          estimated_delivery: '30 mins'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 17: Verify driver details appear
    await expect(page.locator('[data-testid="driver-name"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Ahmed Driver')).toBeVisible();
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('ACCEPTED');

    // Step 18: Simulate shipment in transit
    await page.evaluate(() => {
      const event = new CustomEvent('shipmentInTransit', {
        detail: {
          shipment_id: trackingId,
          status: 'IN_TRANSIT',
          current_location: { lat: 6.5100, lng: 3.3900 }
        }
      });
      window.dispatchEvent(event);
    });

    // Step 19: Verify in-transit status
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('IN_TRANSIT', { timeout: 5000 });
    await expect(page.locator('[data-testid="live-tracking"]')).toBeVisible();

    // Step 20: Simulate delivery with proof
    await page.evaluate(() => {
      const event = new CustomEvent('deliveryProofRequired', {
        detail: {
          shipment_id: trackingId,
          proof_type: 'photo_and_otp'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 21: Verify delivery proof form appears
    await expect(page.locator('[data-testid="delivery-proof-form"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Delivery Proof Required')).toBeVisible();

    // Step 22: Upload delivery photo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/delivery-photo.jpg');
    await page.waitForTimeout(1000);

    // Step 23: Enter OTP
    await page.fill('input[placeholder*="OTP"]', '123456');

    // Step 24: Submit delivery proof
    await page.click('button:has-text("Confirm Delivery")');
    await page.waitForTimeout(2000);

    // Step 25: Verify delivery completed
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('DELIVERED', { timeout: 5000 });
    await expect(page.locator('text=Delivery Confirmed')).toBeVisible();

    // Step 26: Verify final summary
    await expect(page.locator('[data-testid="delivery-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="final-amount"]')).toBeVisible();

    // Step 27: Rate delivery
    await page.click('button:has-text("Rate Delivery")');
    await page.click('[data-testid="star-5"]'); // 5-star rating
    await page.fill('textarea[placeholder*="feedback"]', 'Excellent delivery service!');
    await page.click('button:has-text("Submit Rating")');

    // Step 28: Verify rating submitted
    await expect(page.locator('text=Thank you for your rating')).toBeVisible({ timeout: 5000 });

    // Step 29: Verify shipment appears in history
    await page.goto('/courier/history');
    await expect(page.locator(`text=${trackingId}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=DELIVERED')).toBeVisible();
  });

  test('should handle multi-stop courier deliveries', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to create shipment
    await page.goto('/courier/create');
    await expect(page.locator('text=Create Shipment')).toBeVisible();

    // Step 2: Select package type
    await page.click('button:has-text("Medium Package")');

    // Step 3: Fill package details
    await page.fill('input[placeholder*="weight"]', '5');
    await page.fill('textarea[placeholder*="description"]', 'Multiple deliveries');
    await page.fill('input[placeholder*="value"]', '1000');

    // Step 4: Set pickup location
    await page.click('button:has-text("Select Pickup Location")');
    await page.evaluate(() => {
      const event = new CustomEvent('mapLocationSelected', {
        detail: {
          lat: 6.5244,
          lng: 3.3792,
          address: 'Lekki Phase 1, Lagos'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 5: Add first stop
    await page.click('button:has-text("Add Stop")');
    await page.evaluate(() => {
      const event = new CustomEvent('mapLocationSelected', {
        detail: {
          lat: 6.4344,
          lng: 3.4367,
          address: 'Victoria Island, Lagos'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 6: Add second stop
    await page.click('button:has-text("Add Stop")');
    await page.evaluate(() => {
      const event = new CustomEvent('mapLocationSelected', {
        detail: {
          lat: 6.5500,
          lng: 3.3500,
          address: 'Ikoyi, Lagos'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 7: Verify multi-stop display
    await expect(page.locator('[data-testid="stop-count"]')).toContainText('2 stops');

    // Step 8: Fill recipient details for first stop
    await page.fill('input[placeholder*="recipient name"]', 'Stop 1 Recipient');
    await page.fill('input[placeholder*="recipient phone"]', '+234 810 000 0001');

    // Step 9: Get quote for multi-stop
    await page.click('button:has-text("Get Quote")');
    await page.waitForSelector('[data-testid="quote-summary"]', { timeout: 5000 });

    // Step 10: Verify multi-stop pricing
    const quoteText = await page.locator('[data-testid="quote-price"]').textContent();
    expect(quoteText).toMatch(/₦\d+/);

    // Step 11: Create multi-stop shipment
    await page.click('button:has-text("Confirm & Create Shipment")');
    await page.waitForURL(/\/courier\/tracking\/\w+/, { timeout: 10000 });

    // Step 12: Verify multi-stop shipment created
    await expect(page.locator('[data-testid="stop-count"]')).toContainText('2 stops');
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('PENDING');

    // Step 13: Simulate driver acceptance
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('shipmentAccepted', {
        detail: {
          driver_id: 'driver789',
          driver_name: 'Multi-Stop Driver',
          vehicle_plate: 'MSD-001'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 14: Verify driver accepted multi-stop
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('ACCEPTED', { timeout: 5000 });

    // Step 15: Simulate first stop delivery
    await page.evaluate(() => {
      const event = new CustomEvent('stopDelivered', {
        detail: {
          stop_number: 1,
          status: 'DELIVERED'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 16: Verify first stop marked as delivered
    await expect(page.locator('[data-testid="stop-1-status"]')).toContainText('DELIVERED', { timeout: 5000 });

    // Step 17: Simulate second stop delivery
    await page.evaluate(() => {
      const event = new CustomEvent('stopDelivered', {
        detail: {
          stop_number: 2,
          status: 'DELIVERED'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 18: Verify second stop marked as delivered
    await expect(page.locator('[data-testid="stop-2-status"]')).toContainText('DELIVERED', { timeout: 5000 });

    // Step 19: Verify all stops completed
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('DELIVERED', { timeout: 5000 });
  });

  test('should handle courier cancellation', async ({ page, authenticatedPage }) => {
    // Step 1: Create a shipment
    await page.goto('/courier/create');
    await page.click('button:has-text("Small Package")');
    await page.fill('input[placeholder*="weight"]', '2');
    await page.fill('textarea[placeholder*="description"]', 'Test cancellation');
    await page.fill('input[placeholder*="value"]', '300');

    // Step 2: Set locations
    await page.click('button:has-text("Select Pickup Location")');
    await page.evaluate(() => {
      const event = new CustomEvent('mapLocationSelected', {
        detail: {
          lat: 6.5244,
          lng: 3.3792,
          address: 'Lekki Phase 1, Lagos'
        }
      });
      window.dispatchEvent(event);
    });

    await page.click('button:has-text("Select Dropoff Location")');
    await page.evaluate(() => {
      const event = new CustomEvent('mapLocationSelected', {
        detail: {
          lat: 6.4344,
          lng: 3.4367,
          address: 'Victoria Island, Lagos'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 3: Fill recipient and get quote
    await page.fill('input[placeholder*="recipient name"]', 'Test Recipient');
    await page.fill('input[placeholder*="recipient phone"]', '+234 810 000 0002');
    await page.click('button:has-text("Get Quote")');
    await page.waitForSelector('[data-testid="quote-summary"]', { timeout: 5000 });

    // Step 4: Create shipment
    await page.click('button:has-text("Confirm & Create Shipment")');
    await page.waitForURL(/\/courier\/tracking\/\w+/, { timeout: 10000 });

    // Step 5: Cancel shipment
    await page.click('button:has-text("Cancel Shipment")');
    await page.click('button:has-text("Confirm Cancel")');

    // Step 6: Verify cancellation
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('CANCELLED', { timeout: 5000 });
    await expect(page.locator('text=Shipment cancelled')).toBeVisible();
  });

  test('should display delivery proof submission form', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to an in-transit shipment (simulated)
    await page.goto('/courier/tracking/test-tracking-id');

    // Step 2: Simulate shipment in transit
    await page.evaluate(() => {
      const event = new CustomEvent('shipmentInTransit', {
        detail: {
          shipment_id: 'test-tracking-id',
          status: 'IN_TRANSIT'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 3: Simulate delivery proof requirement
    await page.evaluate(() => {
      const event = new CustomEvent('deliveryProofRequired', {
        detail: {
          shipment_id: 'test-tracking-id',
          proof_type: 'photo_and_otp'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 4: Verify delivery proof form
    await expect(page.locator('[data-testid="delivery-proof-form"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Upload Delivery Photo')).toBeVisible();
    await expect(page.locator('text=Enter OTP')).toBeVisible();

    // Step 5: Verify form fields
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="OTP"]')).toBeVisible();
    await expect(page.locator('button:has-text("Confirm Delivery")')).toBeVisible();
  });
});
