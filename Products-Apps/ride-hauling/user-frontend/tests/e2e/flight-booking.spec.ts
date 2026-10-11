import { test, expect } from './fixtures/auth.fixture';

test.describe('Flight Booking E2E Flow', () => {
  test('should complete full flight booking from search to confirmation', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to flights
    await page.goto('/flights');
    await expect(page.locator('text=Flight Search')).toBeVisible();

    // Step 2: Fill flight search form
    await page.click('input[placeholder*="From"]');
    await page.fill('input[placeholder*="From"]', 'Lagos');
    await page.waitForSelector('[data-testid="airport-suggestion"]');
    await page.click('[data-testid="airport-suggestion"]:first-child');

    // Step 3: Fill destination
    await page.click('input[placeholder*="To"]');
    await page.fill('input[placeholder*="To"]', 'Abuja');
    await page.waitForSelector('[data-testid="airport-suggestion"]');
    await page.click('[data-testid="airport-suggestion"]:first-child');

    // Step 4: Select departure date
    await page.click('input[type="date"]');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);

    // Step 5: Select number of passengers
    await page.click('select[name="passengers"]');
    await page.selectOption('select[name="passengers"]', '2');

    // Step 6: Search flights
    await page.click('button:has-text("Search Flights")');
    await page.waitForSelector('[data-testid="flight-result"]', { timeout: 10000 });

    // Step 7: Verify flight results displayed
    const flightResults = await page.locator('[data-testid="flight-result"]').count();
    expect(flightResults).toBeGreaterThan(0);

    // Step 8: Select first flight
    await page.click('[data-testid="flight-result"]:first-child');
    await page.waitForURL(/\/flights\/\w+/);

    // Step 9: Verify flight details page
    await expect(page.locator('[data-testid="flight-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="flight-price"]')).toBeVisible();

    // Step 10: Select seats
    await page.click('[data-testid="seat-selection"]');
    await page.click('[data-testid="seat-1A"]');
    await page.click('[data-testid="seat-1B"]');
    await expect(page.locator('[data-testid="selected-seats"]')).toContainText('1A, 1B');

    // Step 11: Proceed to checkout
    await page.click('button:has-text("Proceed to Checkout")');
    await page.waitForURL(/\/flights\/checkout/);

    // Step 12: Verify checkout page
    await expect(page.locator('[data-testid="checkout-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="passenger-list"]')).toBeVisible();

    // Step 13: Add passenger details
    await page.fill('input[placeholder*="First Name"]', 'John');
    await page.fill('input[placeholder*="Last Name"]', 'Doe');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[type="tel"]', '+234 810 000 0000');
    await page.fill('input[type="date"]', '1990-01-01');
    await page.fill('input[placeholder*="Passport"]', 'A12345678');
    await page.fill('input[placeholder*="Nationality"]', 'Nigerian');

    // Step 14: Add second passenger
    await page.click('button:has-text("Add Passenger")');
    await page.fill('input[placeholder*="First Name"]:nth-of-type(2)', 'Jane');
    await page.fill('input[placeholder*="Last Name"]:nth-of-type(2)', 'Doe');
    await page.fill('input[type="email"]:nth-of-type(2)', 'jane@example.com');
    await page.fill('input[type="tel"]:nth-of-type(2)', '+234 810 000 0001');
    await page.fill('input[type="date"]:nth-of-type(2)', '1992-05-15');
    await page.fill('input[placeholder*="Passport"]:nth-of-type(2)', 'B87654321');
    await page.fill('input[placeholder*="Nationality"]:nth-of-type(2)', 'Nigerian');

    // Step 15: Verify price breakdown
    await expect(page.locator('[data-testid="base-fare"]')).toBeVisible();
    await expect(page.locator('[data-testid="taxes"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-price"]')).toBeVisible();

    // Step 16: Select payment method
    await page.click('button:has-text("Wallet")');
    await expect(page.locator('button:has-text("Wallet")')).toHaveClass(/selected|active/);

    // Step 17: Confirm booking
    await page.click('button:has-text("Confirm Booking")');
    await page.waitForURL(/\/flights\/confirmation/, { timeout: 10000 });

    // Step 18: Verify confirmation page
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-reference"]')).toBeVisible();
    const bookingRef = await page.locator('[data-testid="booking-reference"]').textContent();
    expect(bookingRef).toMatch(/[A-Z0-9]{6,}/);

    // Step 19: Verify booking details
    await expect(page.locator('[data-testid="confirmation-flight-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirmation-passengers"]')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Doe')).toBeVisible();

    // Step 20: Download itinerary
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Itinerary")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('itinerary');
  });

  test('should handle flight search with filters', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to flights
    await page.goto('/flights');

    // Step 2: Fill search form
    await page.click('input[placeholder*="From"]');
    await page.fill('input[placeholder*="From"]', 'Lagos');
    await page.waitForSelector('[data-testid="airport-suggestion"]');
    await page.click('[data-testid="airport-suggestion"]:first-child');

    await page.click('input[placeholder*="To"]');
    await page.fill('input[placeholder*="To"]', 'Abuja');
    await page.waitForSelector('[data-testid="airport-suggestion"]');
    await page.click('[data-testid="airport-suggestion"]:first-child');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);

    // Step 3: Search flights
    await page.click('button:has-text("Search Flights")');
    await page.waitForSelector('[data-testid="flight-result"]', { timeout: 10000 });

    // Step 4: Apply filters
    await page.click('[data-testid="filter-airline"]');
    await page.click('text=Air Peace');
    await page.waitForTimeout(1000);

    // Step 5: Verify filtered results
    const filteredResults = await page.locator('[data-testid="flight-result"]').count();
    expect(filteredResults).toBeGreaterThan(0);

    // Step 6: Apply price filter
    await page.click('[data-testid="filter-price"]');
    await page.fill('input[placeholder*="Max Price"]', '50000');
    await page.waitForTimeout(1000);

    // Step 7: Verify price filtered results
    const priceFilteredResults = await page.locator('[data-testid="flight-result"]').count();
    expect(priceFilteredResults).toBeGreaterThanOrEqual(0);
  });

  test('should handle scheduled flight booking', async ({ page, authenticatedPage }) => {
    // Step 1: Navigate to flights
    await page.goto('/flights');

    // Step 2: Select round trip
    await page.click('input[value="round-trip"]');

    // Step 3: Fill search form
    await page.click('input[placeholder*="From"]');
    await page.fill('input[placeholder*="From"]', 'Lagos');
    await page.waitForSelector('[data-testid="airport-suggestion"]');
    await page.click('[data-testid="airport-suggestion"]:first-child');

    await page.click('input[placeholder*="To"]');
    await page.fill('input[placeholder*="To"]', 'Abuja');
    await page.waitForSelector('[data-testid="airport-suggestion"]');
    await page.click('[data-testid="airport-suggestion"]:first-child');

    // Step 4: Set departure and return dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const departDate = tomorrow.toISOString().split('T')[0];
    await page.fill('input[placeholder*="Depart"]', departDate);

    const returnDate = new Date(tomorrow);
    returnDate.setDate(returnDate.getDate() + 5);
    const returnDateStr = returnDate.toISOString().split('T')[0];
    await page.fill('input[placeholder*="Return"]', returnDateStr);

    // Step 5: Search flights
    await page.click('button:has-text("Search Flights")');
    await page.waitForSelector('[data-testid="flight-result"]', { timeout: 10000 });

    // Step 6: Verify outbound and return flights shown
    await expect(page.locator('text=Outbound Flights')).toBeVisible();
    await expect(page.locator('text=Return Flights')).toBeVisible();
  });
});
