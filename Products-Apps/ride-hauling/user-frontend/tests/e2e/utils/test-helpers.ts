import { Page, expect } from '@playwright/test';

/**
 * Test helper utilities for E2E testing
 */

export class TestHelpers {
  /**
   * Wait for and verify a toast notification
   */
  static async verifyToast(page: Page, message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const toastSelector = `[data-testid="toast-${type}"]`;
    await expect(page.locator(toastSelector)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(toastSelector)).toContainText(message);
  }

  /**
   * Fill a location input and select from suggestions
   */
  static async selectLocation(page: Page, inputSelector: string, location: string) {
    await page.fill(inputSelector, location);
    await page.waitForSelector('[data-testid="location-suggestion"]', { timeout: 5000 });
    await page.click('[data-testid="location-suggestion"]:first-child');
  }

  /**
   * Simulate a map location selection event
   */
  static async selectMapLocation(page: Page, lat: number, lng: number, address: string) {
    await page.evaluate(
      ({ lat, lng, address }) => {
        const event = new CustomEvent('mapLocationSelected', {
          detail: { lat, lng, address }
        });
        window.dispatchEvent(event);
      },
      { lat, lng, address }
    );
  }

  /**
   * Complete a ride from request to payment
   */
  static async completeRideFlow(
    page: Page,
    rideId: string,
    fare: number,
    driverName: string = 'Test Driver'
  ) {
    // Simulate driver acceptance
    await page.evaluate(
      ({ rideId, driverName, fare }) => {
        const event = new CustomEvent('rideAccepted', {
          detail: {
            driver_id: 'driver_test',
            driver_name: driverName,
            vehicle_plate: 'TEST-001',
            estimated_fare: fare
          }
        });
        window.dispatchEvent(event);
      },
      { rideId, driverName, fare }
    );

    await expect(page.locator('[data-testid="driver-name"]')).toBeVisible({ timeout: 5000 });

    // Simulate ride started
    await page.evaluate(() => {
      const event = new CustomEvent('rideStarted', {
        detail: { ride_id: 'ride_test', status: 'STARTED' }
      });
      window.dispatchEvent(event);
    });

    await expect(page.locator('[data-testid="ride-status"]')).toContainText('STARTED', { timeout: 5000 });

    // Simulate ride completed
    await page.evaluate(
      ({ rideId, fare }) => {
        const event = new CustomEvent('rideCompleted', {
          detail: {
            ride_id: rideId,
            status: 'COMPLETED',
            fare: fare,
            local_fare: fare,
            currency: 'NGN'
          }
        });
        window.dispatchEvent(event);
      },
      { rideId, fare }
    );

    await expect(page.locator('[data-testid="ride-status"]')).toContainText('COMPLETED', { timeout: 5000 });
  }

  /**
   * Complete a courier shipment from creation to delivery
   */
  static async completeCourierFlow(
    page: Page,
    trackingId: string,
    driverName: string = 'Courier Driver'
  ) {
    // Simulate driver acceptance
    await page.evaluate(
      ({ trackingId, driverName }) => {
        const event = new CustomEvent('shipmentAccepted', {
          detail: {
            driver_id: 'driver_courier',
            driver_name: driverName,
            vehicle_plate: 'COURIER-001',
            estimated_delivery: '30 mins'
          }
        });
        window.dispatchEvent(event);
      },
      { trackingId, driverName }
    );

    await expect(page.locator('[data-testid="driver-name"]')).toBeVisible({ timeout: 5000 });

    // Simulate in transit
    await page.evaluate(
      ({ trackingId }) => {
        const event = new CustomEvent('shipmentInTransit', {
          detail: {
            shipment_id: trackingId,
            status: 'IN_TRANSIT',
            current_location: { lat: 6.5100, lng: 3.3900 }
          }
        });
        window.dispatchEvent(event);
      },
      { trackingId }
    );

    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('IN_TRANSIT', { timeout: 5000 });

    // Simulate delivery proof required
    await page.evaluate(
      ({ trackingId }) => {
        const event = new CustomEvent('deliveryProofRequired', {
          detail: {
            shipment_id: trackingId,
            proof_type: 'photo_and_otp'
          }
        });
        window.dispatchEvent(event);
      },
      { trackingId }
    );

    await expect(page.locator('[data-testid="delivery-proof-form"]')).toBeVisible({ timeout: 5000 });
  }

  /**
   * Submit delivery proof
   */
  static async submitDeliveryProof(page: Page, otp: string = '123456') {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/delivery-photo.jpg');
    await page.fill('input[placeholder*="OTP"]', otp);
    await page.click('button:has-text("Confirm Delivery")');
  }

  /**
   * Verify currency formatting
   */
  static async verifyCurrencyFormat(page: Page, selector: string, currency: string = '₦') {
    const text = await page.locator(selector).textContent();
    expect(text).toMatch(new RegExp(`${currency}\\d+`));
  }

  /**
   * Wait for payment processing and simulate success
   */
  static async completePayment(
    page: Page,
    amount: number,
    method: 'wallet' | 'card' | 'coins' = 'wallet',
    transactionId: string = 'txn_test_001'
  ) {
    await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(2000);

    await page.evaluate(
      ({ amount, method, transactionId }) => {
        const event = new CustomEvent('paymentSuccess', {
          detail: {
            transaction_id: transactionId,
            amount: amount,
            method: method,
            status: 'completed'
          }
        });
        window.dispatchEvent(event);
      },
      { amount, method, transactionId }
    );

    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({ timeout: 5000 });
  }

  /**
   * Rate a service (ride or delivery)
   */
  static async rateService(page: Page, stars: number = 5, feedback: string = 'Great service!') {
    await page.click('button:has-text("Rate")');
    await page.click(`[data-testid="star-${stars}"]`);
    await page.fill('textarea[placeholder*="feedback"]', feedback);
    await page.click('button:has-text("Submit")');
  }

  /**
   * Verify ride/shipment appears in history
   */
  static async verifyInHistory(page: Page, id: string, status: string = 'COMPLETED') {
    await expect(page.locator(`text=${id}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${status}`)).toBeVisible();
  }

  /**
   * Get current fare/price from page
   */
  static async getFareAmount(page: Page, selector: string = '[data-testid="final-fare"]'): Promise<number> {
    const text = await page.locator(selector).textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  /**
   * Simulate surge pricing event
   */
  static async simulateSurgePricing(page: Page, multiplier: number = 2.5) {
    await page.evaluate(
      ({ multiplier }) => {
        const event = new CustomEvent('surgePricingActive', {
          detail: { multiplier, reason: 'High demand' }
        });
        window.dispatchEvent(event);
      },
      { multiplier }
    );
  }

  /**
   * Simulate ride cancellation
   */
  static async cancelRide(page: Page, rideId: string, reason: string = 'User cancelled') {
    await page.click('button:has-text("Cancel Ride")');
    await page.click('button:has-text("Confirm Cancel")');
    await expect(page.locator('[data-testid="ride-status"]')).toContainText('CANCELLED', { timeout: 5000 });
  }

  /**
   * Simulate shipment cancellation
   */
  static async cancelShipment(page: Page, shipmentId: string, reason: string = 'User cancelled') {
    await page.click('button:has-text("Cancel Shipment")');
    await page.click('button:has-text("Confirm Cancel")');
    await expect(page.locator('[data-testid="shipment-status"]')).toContainText('CANCELLED', { timeout: 5000 });
  }

  /**
   * Verify payment method selection
   */
  static async selectPaymentMethod(page: Page, method: 'wallet' | 'card' | 'coins') {
    const methodLabel = method.charAt(0).toUpperCase() + method.slice(1);
    await page.click(`button:has-text("${methodLabel}")`);
    await expect(page.locator(`text=${methodLabel}`)).toHaveClass(/selected|active/);
  }

  /**
   * Wait for and verify loading state
   */
  static async waitForLoading(page: Page, shouldDisappear: boolean = true) {
    const loader = page.locator('[data-testid="loader"], [data-testid="loading"]');
    if (shouldDisappear) {
      await expect(loader).not.toBeVisible({ timeout: 10000 });
    } else {
      await expect(loader).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Verify error message
   */
  static async verifyError(page: Page, errorMessage: string) {
    await expect(page.locator(`text=${errorMessage}`)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get text content from element
   */
  static async getText(page: Page, selector: string): Promise<string | null> {
    return await page.locator(selector).textContent();
  }

  /**
   * Check if element is visible
   */
  static async isVisible(page: Page, selector: string): Promise<boolean> {
    return await page.locator(selector).isVisible();
  }
}
