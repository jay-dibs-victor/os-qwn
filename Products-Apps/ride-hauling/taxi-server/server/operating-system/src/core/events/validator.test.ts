import { OSEvent } from './event.schemas';
import { validateEvent, assertValidEvent } from './validator';

describe('EventValidator', () => {
  describe('validateEvent', () => {
    it('should validate a valid RIDE_REQUESTED payload', () => {
      const payload = {
        requestId: 'R123',
        userId: 'U456',
        origin: { address: '123 Main St', lat: 6.5, lng: 3.4 },
        destination: { address: '456 West St', lat: 6.6, lng: 3.5 },
        rideType: 'Economy',
        timestamp: new Date().toISOString(),
      };

      const result = validateEvent(OSEvent.RIDE_REQUESTED, payload);
      expect(result.valid).toBe(true);
      expect(result.data.requestId).toBe('R123');
    });

    it('should reject an invalid RIDE_REQUESTED payload (missing fields)', () => {
      const payload = {
        requestId: 'R123',
        // missing userId
      };

      const result = validateEvent(OSEvent.RIDE_REQUESTED, payload);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('userId: Required');
    });

    it('should validate a valid PAYMENT_INITIATED payload', () => {
      const payload = {
        paymentId: 'P789',
        userId: 'U456',
        amount: 5000,
        currency: 'NGN',
        reference: 'REF001',
        status: 'INITIATED',
        timestamp: new Date().toISOString(),
      };

      const result = validateEvent(OSEvent.PAYMENT_INITIATED, payload);
      expect(result.valid).toBe(true);
    });

    it('should reject an invalid PAYMENT_INITIATED payload (invalid status)', () => {
      const payload = {
        paymentId: 'P789',
        userId: 'U456',
        amount: 5000,
        currency: 'NGN',
        reference: 'REF001',
        status: 'INVALID_STATUS', // enum mismatch
        timestamp: new Date().toISOString(),
      };

      const result = validateEvent(OSEvent.PAYMENT_INITIATED, payload);
      expect(result.valid).toBe(false);
    });
  });

  describe('assertValidEvent', () => {
    it('should throw error for invalid payload', () => {
      const payload = { requestId: 'R123' };
      expect(() => assertValidEvent(OSEvent.RIDE_REQUESTED, payload)).toThrow();
    });

    it('should return data for valid payload', () => {
      const payload = {
        requestId: 'R123',
        userId: 'U456',
        origin: { address: 'A', lat: 0, lng: 0 },
        destination: { address: 'B', lat: 0, lng: 0 },
        timestamp: new Date().toISOString(),
      };
      const data = assertValidEvent(OSEvent.RIDE_REQUESTED, payload);
      expect(data).toBeDefined();
    });
  });
});
