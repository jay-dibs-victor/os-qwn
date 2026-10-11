export type DriverPhase =
  | 'offline'
  | 'searching'
  | 'finding_trip'
  | 'incoming_ride'
  | 'driving_to_pickup'
  | 'arrived'
  | 'in_progress'
  | 'trip_complete'
  | 'cancelled';

export type ServiceType = 'economy' | 'business' | 'premium';

export type DocumentStatus = 'verified' | 'pending' | 'expired' | 'missing';
export type PaymentMethod = 'cash' | 'wallet' | 'queens_coin' | 'bank_card' | 'opay' | 'voucher';


export type TripPaymentStatus = 
  | 'pending'
  | 'collected'
  | 'settled'
  | 'disputed'
  | 'refunded';

export type CommissionStatus =
  | 'pending'
  | 'deducted'
  | 'paid'
  | 'overdue'
  | 'waived';

export interface LatLngDTO {
  latitude: number;
  longitude: number;
}

export interface FareDTO {
  amount: number;
  currency: string;
  base_fare: number;
  distance_fare: number;
  time_fare: number;
  surge: number;
  tip: number;
  toll: number;
}

export interface PassengerDTO {
  id: string;
  first_name: string;
  last_name: string;
  rating: number;
  phone: string;
  photo_url?: string | null;
}

export interface RideRequestDTO {
  id: string;
  pickup: LatLngDTO;
  destination: LatLngDTO;
  fare: FareDTO;
  passenger: PassengerDTO;
  pickup_address: string;
  destination_address: string;
  distance_km: number;
  duration_min: number;
  paymentMethod: PaymentMethod;
  commissionAmount: number;
  paymentStatus: TripPaymentStatus;
  commissionStatus: CommissionStatus;
  voucherCode?: string;
  voucherValue?: number;
}

export interface CommissionDebtDTO {
  rideId: string;
  amount: number;
  dueAt: string;
  status: CommissionStatus;
  createdAt: string;
}


export interface EarningsDayDTO {
  day: string;
  date: string;
  amount: number;
  rides: number;
}

export interface EarningsDTO {
  currency: string;
  weekly_earnings: number;
  weekly_rides: number;
  today_earnings: number;
  today_rides: number;
  today_minutes: number;
  acceptance_rate: number;
  cancellation_rate: number;
  driver_tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  weekly_breakdown: EarningsDayDTO[];
}

export interface TripHistoryItemDTO {
  id: string;
  date: string;
  pickup: string;
  destination: string;
  fare: FareDTO;
  passenger_name: string;
  distance_km: number;
  duration_min: number;
  payment_method: PaymentMethod;
  status: TripStatus;
  commissionStatus?: CommissionStatus; // Added field
  rating_from_passenger?: number | null;
  service_type: ServiceType;
}

export interface WalletLedgerEntryDTO {
  id: string;
  date: string;
  time: string;
  description: string;
  amount: number;
  currency: string;
  type: LedgerType;
  category: LedgerCategory;
  status: LedgerStatus;
  reference?: string | null;
  commissionDebtId?: string; // Added field
}

export interface WalletSummaryDTO {
  currency: string;
  balance: number;
  pending_balance: number;
  lifetime_earnings: number;
  ledger: WalletLedgerEntryDTO[];
}

export interface DocumentDTO {
  status: DocumentStatus;
  expires: string;
  reference?: string | null;
}

export interface VehicleDTO {
  make: string;
  model: string;
  year: number;
  color: string;
  plate: string;
  type: ServiceType;
  seats: number;
  insurance: {
    provider: string;
    policy_number: string;
    expires: string;
  };
  inspection: {
    last_date: string;
    next_date: string;
    status: DocumentStatus;
  };
}

export interface BankDetailsDTO {
  bank_name: string;
  account_holder: string;
  account_number: string;
  routing_number: string;
}

export interface DriverProfileDTO {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  date_of_birth: string;
  referral_code: string;
  tier: EarningsDTO['driver_tier'];
  rating: number;
  is_online: boolean;
  total_trips: number;
  total_earnings: number;
  years_on_platform: number;
  vehicle: VehicleDTO;
  documents: {
    birth_certificate: DocumentDTO;
    license: DocumentDTO;
    passport: DocumentDTO;
    insurance: DocumentDTO;
    medical: DocumentDTO;
  };
  bank: BankDetailsDTO;
}
