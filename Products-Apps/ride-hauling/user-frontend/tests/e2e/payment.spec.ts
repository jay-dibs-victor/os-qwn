import { test, expect } from './fixtures/auth.fixture';

test.describe('Payment Flow E2E Tests', () => {
  test('should complete payment with wallet balance', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to ride booking
    await page.goto('/dashboard');
    await page.click('button:has-text("Book a Ride")');

    // Step 2: Fill ride details
    await page.fill('input[placeholder*="pickup"]', 'Lekki Phase 1, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]', { timeout: 5000 });
    await page.click('[data-testid="location-suggestion"]:first-child');

    await page.fill('input[placeholder*="destination"]', 'Victoria Island, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]', { timeout: 5000 });
    await page.click('[data-testid="location-suggestion"]:first-child');

    // Step 3: Request ride
    await page.click('button:has-text("Request Ride")');
    await page.waitForURL(/\/ride\/\w+/, { timeout: 10000 });

    // Step 4: Simulate ride completion
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('rideCompleted', {
        detail: {
          ride_id: 'ride123',
          status: 'COMPLETED',
          fare: 2500,
          local_fare: 2500,
          currency: 'NGN'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 5: Verify payment summary appears
    await expect(page.locator('[data-testid="payment-summary"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="final-fare"]')).toBeVisible();

    // Step 6: Verify fare amount
    const fareText = await page.locator('[data-testid="final-fare"]').textContent();
    expect(fareText).toMatch(/₦\d+/);

    // Step 7: Select wallet payment method
    await page.click('button:has-text("Wallet")');
    await expect(page.locator('text=Wallet')).toHaveClass(/selected|active/);

    // Step 8: Verify wallet balance display
    await expect(page.locator('[data-testid="wallet-balance"]')).toBeVisible();
    const balanceText = await page.locator('[data-testid="wallet-balance"]').textContent();
    expect(balanceText).toMatch(/₦\d+/);

    // Step 9: Confirm payment
    await page.click('button:has-text("Pay with Wallet")');

    // Step 10: Verify payment processing
    await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible({ timeout: 5000 });

    // Step 11: Simulate payment success
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('paymentSuccess', {
        detail: {
          transaction_id: 'txn123456',
          amount: 2500,
          method: 'wallet',
          status: 'completed'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 12: Verify payment success
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Payment Successful')).toBeVisible();

    // Step 13: Verify transaction details
    await expect(page.locator('[data-testid="transaction-id"]')).toBeVisible();
    await expect(page.locator('text=txn123456')).toBeVisible();

    // Step 14: Verify receipt
    await expect(page.locator('[data-testid="receipt"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-amount"]')).toContainText('₦2,500');

    // Step 15: Download receipt
    await page.click('button:has-text("Download Receipt")');
    await page.waitForTimeout(1000);

    // Step 16: Verify ride appears in history
    await page.goto('/ride-history');
    await expect(page.locator('text=COMPLETED')).toBeVisible({ timeout: 5000 });
  });

  test('should complete payment with card', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to ride booking
    await page.goto('/dashboard');
    await page.click('button:has-text("Book a Ride")');

    // Step 2: Fill ride details
    await page.fill('input[placeholder*="pickup"]', 'Lekki Phase 1, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]', { timeout: 5000 });
    await page.click('[data-testid="location-suggestion"]:first-child');

    await page.fill('input[placeholder*="destination"]', 'Victoria Island, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]', { timeout: 5000 });
    await page.click('[data-testid="location-suggestion"]:first-child');

    // Step 3: Request ride
    await page.click('button:has-text("Request Ride")');
    await page.waitForURL(/\/ride\/\w+/, { timeout: 10000 });

    // Step 4: Simulate ride completion
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('rideCompleted', {
        detail: {
          ride_id: 'ride456',
          status: 'COMPLETED',
          fare: 3500,
          local_fare: 3500,
          currency: 'NGN'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 5: Verify payment summary
    await expect(page.locator('[data-testid="payment-summary"]')).toBeVisible({ timeout: 5000 });

    // Step 6: Select card payment method
    await page.click('button:has-text("Card")');
    await expect(page.locator('text=Card')).toHaveClass(/selected|active/);

    // Step 7: Verify card selection options
    await expect(page.locator('[data-testid="saved-cards"]')).toBeVisible();

    // Step 8: Select a saved card
    await page.click('[data-testid="card-option"]:first-child');

    // Step 9: Confirm payment
    await page.click('button:has-text("Pay with Card")');

    // Step 10: Verify payment processing
    await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible({ timeout: 5000 });

    // Step 11: Simulate payment success
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('paymentSuccess', {
        detail: {
          transaction_id: 'txn789012',
          amount: 3500,
          method: 'card',
          status: 'completed',
          card_last_four: '4242'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 12: Verify payment success
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Payment Successful')).toBeVisible();

    // Step 13: Verify card details in receipt
    await expect(page.locator('[data-testid="receipt"]')).toBeVisible();
    await expect(page.locator('text=Card ending in 4242')).toBeVisible();
  });

  test('should complete payment with coins', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to flight booking
    await page.goto('/dashboard');
    await page.click('button:has-text("Book a Flight")');

    // Step 2: Search for flights
    await page.fill('input[placeholder*="from"]', 'Lagos');
    await page.fill('input[placeholder*="to"]', 'Abuja');
    await page.fill('input[type="date"]', '2026-06-15');
    await page.click('button:has-text("Search")');

    // Step 3: Wait for flight results
    await page.waitForSelector('[data-testid="flight-result"]', { timeout: 10000 });

    // Step 4: Select a flight
    await page.click('[data-testid="flight-result"]:first-child');

    // Step 5: Select seat
    await page.click('[data-testid="seat-selector"]');
    await page.click('[data-testid="seat-12A"]');

    // Step 6: Fill passenger details
    await page.fill('input[placeholder*="first name"]', 'Test');
    await page.fill('input[placeholder*="last name"]', 'User');
    await page.fill('input[placeholder*="email"]', 'testuser@example.com');

    // Step 7: Proceed to payment
    await page.click('button:has-text("Proceed to Payment")');
    await page.waitForSelector('[data-testid="payment-summary"]', { timeout: 5000 });

    // Step 8: Verify flight price
    const priceText = await page.locator('[data-testid="flight-price"]').textContent();
    expect(priceText).toMatch(/₦\d+/);

    // Step 9: Select coins payment method
    await page.click('button:has-text("Coins")');
    await expect(page.locator('text=Coins')).toHaveClass(/selected|active/);

    // Step 10: Verify coin balance
    await expect(page.locator('[data-testid="coin-balance"]')).toBeVisible();
    const coinText = await page.locator('[data-testid="coin-balance"]').textContent();
    expect(coinText).toMatch(/\d+\s*coins/);

    // Step 11: Confirm payment
    await page.click('button:has-text("Pay with Coins")');

    // Step 12: Verify payment processing
    await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible({ timeout: 5000 });

    // Step 13: Simulate payment success
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('paymentSuccess', {
        detail: {
          transaction_id: 'txn345678',
          amount: 50000,
          method: 'coins',
          status: 'completed',
          coins_used: 500
        }
      });
      window.dispatchEvent(event);
    });

    // Step 14: Verify payment success
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Payment Successful')).toBeVisible();

    // Step 15: Verify coins deducted in receipt
    await expect(page.locator('[data-testid="receipt"]')).toBeVisible();
    await expect(page.locator('text=500 coins')).toBeVisible();

    // Step 16: Verify booking confirmation
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
  });

  test('should handle payment failure and retry', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to ride booking
    await page.goto('/dashboard');
    await page.click('button:has-text("Book a Ride")');

    // Step 2: Fill ride details
    await page.fill('input[placeholder*="pickup"]', 'Lekki Phase 1, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]', { timeout: 5000 });
    await page.click('[data-testid="location-suggestion"]:first-child');

    await page.fill('input[placeholder*="destination"]', 'Victoria Island, Lagos');
    await page.waitForSelector('[data-testid="location-suggestion"]', { timeout: 5000 });
    await page.click('[data-testid="location-suggestion"]:first-child');

    // Step 3: Request ride
    await page.click('button:has-text("Request Ride")');
    await page.waitForURL(/\/ride\/\w+/, { timeout: 10000 });

    // Step 4: Simulate ride completion
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('rideCompleted', {
        detail: {
          ride_id: 'ride789',
          status: 'COMPLETED',
          fare: 2000,
          local_fare: 2000,
          currency: 'NGN'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 5: Verify payment summary
    await expect(page.locator('[data-testid="payment-summary"]')).toBeVisible({ timeout: 5000 });

    // Step 6: Select wallet payment
    await page.click('button:has-text("Wallet")');

    // Step 7: Attempt payment
    await page.click('button:has-text("Pay with Wallet")');

    // Step 8: Simulate payment failure
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('paymentFailed', {
        detail: {
          transaction_id: 'txn_failed_001',
          error: 'Insufficient balance',
          error_code: 'INSUFFICIENT_FUNDS'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 9: Verify payment failure message
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Insufficient balance')).toBeVisible();

    // Step 10: Verify retry button
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();

    // Step 11: Switch to card payment
    await page.click('button:has-text("Card")');

    // Step 12: Select card
    await page.click('[data-testid="card-option"]:first-child');

    // Step 13: Retry payment
    await page.click('button:has-text("Pay with Card")');

    // Step 14: Verify payment processing
    await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible({ timeout: 5000 });

    // Step 15: Simulate successful retry
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('paymentSuccess', {
        detail: {
          transaction_id: 'txn_retry_001',
          amount: 2000,
          method: 'card',
          status: 'completed'
        }
      });
      window.dispatchEvent(event);
    });

    // Step 16: Verify payment success after retry
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Payment Successful')).toBeVisible();
  });

  test('should display payment history', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to payment history
    await page.goto('/payments');

    // Step 2: Verify payment history page
    await expect(page.locator('text=Payment History')).toBeVisible();

    // Step 3: Verify payment list
    await expect(page.locator('[data-testid="payment-list"]')).toBeVisible();

    // Step 4: Verify payment entries
    await expect(page.locator('[data-testid="payment-item"]')).toHaveCount(3, { timeout: 5000 });

    // Step 5: Verify payment details in list
    await expect(page.locator('[data-testid="payment-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-method"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-status"]')).toBeVisible();

    // Step 6: Click on a payment to view details
    await page.click('[data-testid="payment-item"]:first-child');

    // Step 7: Verify payment detail view
    await expect(page.locator('[data-testid="payment-detail"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="transaction-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="receipt"]')).toBeVisible();

    // Step 8: Verify download receipt option
    await expect(page.locator('button:has-text("Download Receipt")')).toBeVisible();
  });

  test('should handle wallet top-up', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to wallet
    await page.goto('/wallet');

    // Step 2: Verify wallet page
    await expect(page.locator('text=Wallet')).toBeVisible();

    // Step 3: Verify current balance
    await expect(page.locator('[data-testid="wallet-balance"]')).toBeVisible();

    // Step 4: Click top-up button
    await page.click('button:has-text("Top Up")');

    // Step 5: Verify top-up modal
    await expect(page.locator('[data-testid="topup-modal"]')).toBeVisible({ timeout: 5000 });

    // Step 6: Select top-up amount
    await page.click('button:has-text("₦5,000")');

    // Step 7: Select payment method
    await page.click('button:has-text("Card")');

    // Step 8: Confirm top-up
    await page.click('button:has-text("Confirm Top Up")');

    // Step 9: Verify payment processing
    await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible({ timeout: 5000 });

    // Step 10: Simulate top-up success
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const event = new CustomEvent('topupSuccess', {
        detail: {
          transaction_id: 'topup_001',
          amount: 5000,
          new_balance: 15000
        }
      });
      window.dispatchEvent(event);
    });

    // Step 11: Verify top-up success
    await expect(page.locator('[data-testid="topup-success"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Top Up Successful')).toBeVisible();

    // Step 12: Verify updated balance
    const newBalance = await page.locator('[data-testid="wallet-balance"]').textContent();
    expect(newBalance).toMatch(/₦15,000/);
  });
});
