/**
 * Test data generators and fixtures
 */

export interface TestLocation {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

export interface TestRide {
  id: string;
  pickup: TestLocation;
  dropoff: TestLocation;
  fare: number;
  driverName: string;
  vehiclePlate: string;
}

export interface TestCourier {
  id: string;
  senderName: string;
  recipientName: string;
  recipientPhone: string;
  pickup: TestLocation;
  dropoff: TestLocation;
  packageType: 'documents' | 'small' | 'medium' | 'large';
  weight: number;
  value: number;
  fare: number;
}

export interface TestUser {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
}

export interface TestDriver {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  vehiclePlate: string;
}

export class TestData {
  /**
   * Common test locations in Lagos
   */
  static readonly LOCATIONS = {
    LEKKI_PHASE_1: {
      name: 'Lekki Phase 1',
      lat: 6.5244,
      lng: 3.3792,
      address: 'Lekki Phase 1, Lagos'
    },
    VICTORIA_ISLAND: {
      name: 'Victoria Island',
      lat: 6.4344,
      lng: 3.4367,
      address: 'Victoria Island, Lagos'
    },
    IKOYI: {
      name: 'Ikoyi',
      lat: 6.5500,
      lng: 3.3500,
      address: 'Ikoyi, Lagos'
    },
    MAINLAND: {
      name: 'Mainland',
      lat: 6.5500,
      lng: 3.3500,
      address: 'Mainland, Lagos'
    },
    AJAH: {
      name: 'Ajah',
      lat: 6.4500,
      lng: 3.5500,
      address: 'Ajah, Lagos'
    }
  };

  /**
   * Generate a test user
   */
  static generateUser(overrides?: Partial<TestUser>): TestUser {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'TestPassword123!',
      phone: '+234 810 000 0000',
      firstName: 'Test',
      lastName: 'User',
      ...overrides
    };
  }

  /**
   * Generate a test driver
   */
  static generateDriver(overrides?: Partial<TestDriver>): TestDriver {
    const timestamp = Date.now();
    return {
      email: `testdriver${timestamp}@example.com`,
      password: 'DriverPassword123!',
      phone: '+234 810 111 1111',
      firstName: 'Test',
      lastName: 'Driver',
      vehiclePlate: `ABC-${Math.floor(Math.random() * 1000)}`,
      ...overrides
    };
  }

  /**
   * Generate a test ride
   */
  static generateRide(overrides?: Partial<TestRide>): TestRide {
    const timestamp = Date.now();
    return {
      id: `ride_${timestamp}`,
      pickup: this.LOCATIONS.LEKKI_PHASE_1,
      dropoff: this.LOCATIONS.VICTORIA_ISLAND,
      fare: 2500,
      driverName: 'Test Driver',
      vehiclePlate: 'ABC-123',
      ...overrides
    };
  }

  /**
   * Generate a test courier shipment
   */
  static generateCourier(overrides?: Partial<TestCourier>): TestCourier {
    const timestamp = Date.now();
    return {
      id: `shipment_${timestamp}`,
      senderName: 'Test Sender',
      recipientName: 'Test Recipient',
      recipientPhone: '+234 810 000 0001',
      pickup: this.LOCATIONS.LEKKI_PHASE_1,
      dropoff: this.LOCATIONS.VICTORIA_ISLAND,
      packageType: 'small',
      weight: 2.5,
      value: 500,
      fare: 1500,
      ...overrides
    };
  }

  /**
   * Generate random ride fare based on distance
   */
  static calculateFare(distanceKm: number, surgeMultiplier: number = 1): number {
    // Base: $0.50 + (Distance/1000 × $0.12) + (Duration/60 × $0.02)
    // Assuming 1 km = 2 minutes
    const baseFare = 0.5;
    const distanceFare = (distanceKm / 1000) * 0.12;
    const durationMinutes = distanceKm * 2;
    const durationFare = (durationMinutes / 60) * 0.02;
    const totalUSD = (baseFare + distanceFare + durationFare) * surgeMultiplier;
    
    // Convert to NGN (assuming 1 USD = 1500 NGN)
    return Math.round(totalUSD * 1500);
  }

  /**
   * Generate random courier fare based on distance and weight
   */
  static calculateCourierFare(distanceKm: number, weight: number, surgeMultiplier: number = 1): number {
    // Base fare + distance + weight surcharge
    const baseFare = 0.5;
    const distanceFare = (distanceKm / 1000) * 0.12;
    const weightSurcharge = weight > 5 ? (weight - 5) * 0.05 : 0;
    const totalUSD = (baseFare + distanceFare + weightSurcharge) * surgeMultiplier;
    
    // Convert to NGN
    return Math.round(totalUSD * 1500);
  }

  /**
   * Get random location from predefined locations
   */
  static getRandomLocation(): TestLocation {
    const locations = Object.values(this.LOCATIONS);
    return locations[Math.floor(Math.random() * locations.length)];
  }

  /**
   * Generate multi-stop ride
   */
  static generateMultiStopRide(stops: number = 2): TestRide & { stops: TestLocation[] } {
    const ride = this.generateRide();
    const stopLocations: TestLocation[] = [];
    
    for (let i = 0; i < stops; i++) {
      stopLocations.push(this.getRandomLocation());
    }
    
    return {
      ...ride,
      stops: stopLocations
    };
  }

  /**
   * Generate multi-stop courier shipment
   */
  static generateMultiStopCourier(stops: number = 2): TestCourier & { stops: TestLocation[] } {
    const courier = this.generateCourier();
    const stopLocations: TestLocation[] = [];
    
    for (let i = 0; i < stops; i++) {
      stopLocations.push(this.getRandomLocation());
    }
    
    return {
      ...courier,
      stops: stopLocations
    };
  }

  /**
   * Payment methods for testing
   */
  static readonly PAYMENT_METHODS = {
    WALLET: 'wallet',
    CARD: 'card',
    COINS: 'coins'
  };

  /**
   * Ride types
   */
  static readonly RIDE_TYPES = {
    FAIR: 'fair',
    COMFORT: 'comfort',
    PREMIUM: 'premium'
  };

  /**
   * Package types for courier
   */
  static readonly PACKAGE_TYPES = {
    DOCUMENTS: 'documents',
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large'
  };

  /**
   * Ride statuses
   */
  static readonly RIDE_STATUSES = {
    SEARCHING: 'SEARCHING',
    ACCEPTED: 'ACCEPTED',
    STARTED: 'STARTED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  };

  /**
   * Shipment statuses
   */
  static readonly SHIPMENT_STATUSES = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED'
  };

  /**
   * Generate OTP for testing
   */
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate transaction ID
   */
  static generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate ride ID
   */
  static generateRideId(): string {
    return `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate shipment ID
   */
  static generateShipmentId(): string {
    return `shipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get distance between two coordinates (Haversine formula)
   */
  static getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get estimated duration in minutes
   */
  static getEstimatedDuration(distanceKm: number): number {
    // Assuming average speed of 30 km/h in Lagos traffic
    return Math.ceil((distanceKm / 30) * 60);
  }
}
