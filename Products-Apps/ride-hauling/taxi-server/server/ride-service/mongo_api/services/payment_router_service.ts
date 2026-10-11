export type PaymentGateway = 'paystack' | 'stripe' | 'paypal' | 'flutterwave';

export class PaymentRouterService {
  /**
   * Determine the best payment gateway based on country code
   */
  static getBestGateway(countryCode: string): PaymentGateway {
    const code = countryCode.toUpperCase();

    // 1. West Africa Regional Leaders
    if (['NG', 'GH'].includes(code)) {
      return 'paystack';
    }

    // 2. East/South Africa
    if (['KE', 'ZA', 'RW', 'UG', 'TZ'].includes(code)) {
      return 'flutterwave';
    }

    // 3. Middle East (UAE, etc)
    // Stripe has strong presence and localized AED support
    if (['AE', 'SA', 'QA'].includes(code)) {
      return 'stripe';
    }

    // 4. North America & Europe
    if (['US', 'CA', 'GB', 'FR', 'DE', 'ES', 'IT'].includes(code)) {
      return 'stripe';
    }

    // 5. Global Fallback
    return 'stripe';
  }

  /**
   * Get supported gateways for a region (for manual selection if needed)
   */
  static getSupportedGateways(countryCode: string): PaymentGateway[] {
    const code = countryCode.toUpperCase();
    
    if (['NG', 'GH'].includes(code)) {
      return ['paystack', 'flutterwave'];
    }

    if (['US', 'CA', 'GB', 'EU'].includes(code)) {
      return ['stripe', 'paypal'];
    }

    return ['stripe', 'paypal', 'flutterwave'];
  }
}
