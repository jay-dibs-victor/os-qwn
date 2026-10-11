import { create } from 'zustand';
import {
  BankDetailsDTO,
  DriverPhase,
  DriverProfileDTO,
  EarningsDTO,
  RideRequestDTO,
  ServiceType,
  TripHistoryItemDTO,
  WalletLedgerEntryDTO,
  WalletSummaryDTO,
  CommissionDebtDTO,
} from '../api/dto';

import { driverAPI } from '../api/driver';
import { walletAPI } from '../api/wallet';
import { tripsAPI } from '../api/trips';
import { getApiErrorMessage } from '../utils/errors';
import { isMockMode } from '../config/env';
import { secureStorage } from '../utils/storage';
import { ClientEvents, isLocationPayload } from '../realtime/events';
import { MockSimulationService } from '../services/mock-simulation';

/**
 * Module-level reference to the live socket. The SocketProvider installs an
 * emitter on mount; the store uses it to forward driver actions to the
 * gateway without depending on `socket.io-client` directly.
 */
let socketEmitter: ((event: string, payload: unknown) => void) | null = null;
export function setDriverSocketEmitter(fn: typeof socketEmitter) {
  socketEmitter = fn;
}
function emit(event: string, payload: unknown) {
  if (socketEmitter) socketEmitter(event, payload);
}

export type ServiceFilter = 'all' | 'economy' | 'business' | 'premium';

export interface SavedCard {
  id: string;
  last4: string;
  holder: string;
  exp: string;
  brand?: string;
}

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export type LocationPermission = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export interface DriverState {
  // Connectivity
  isOnline: boolean;
  isLoading: boolean;
  phase: DriverPhase;
  serviceFilter: ServiceFilter;
  wsConnected: boolean;

  // Search
  searchDurationSec: number;
  pulseDot: 0 | 1 | 2;

  // Ride lifecycle
  currentRide: RideRequestDTO | null;
  commissionDebts: CommissionDebtDTO[];
  accountRestricted: boolean;
  savedCards: SavedCard[];
  cashCollected: boolean;
  riderDidNotPay: boolean;
  countdown: number;
  arrivedWaitSec: number;
  tollAmount: number;
  tollModalOpen: boolean;
  cancelReasonOpen: boolean;
  currentTripId: string | null;
  totalCommissionOwed: number;

  // Data
  offers: RideRequestDTO[];
  earnings: EarningsDTO;
  history: TripHistoryItemDTO[];
  wallet: WalletSummaryDTO;
  profile: DriverProfileDTO;
  historyCursor: string | null;
  historyLoading: boolean;

  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  heatPoints: any[];
  surgeZones: any[];
  mapRecenterTick: number;

  // Live device location
  currentLocation: CurrentLocation | null;
  locationPermission: LocationPermission;
  locationError: string | null;
  locationRequestedOnce: boolean;
  mapCenteredOnce: boolean;

  // Refs (private — never read by selectors)
  timers: {
    search: ReturnType<typeof setInterval> | null;
    pulse: ReturnType<typeof setInterval> | null;
    countdown: ReturnType<typeof setInterval> | null;
    arrivedWait: ReturnType<typeof setInterval> | null;
    phaseReset: ReturnType<typeof setTimeout> | null;
  };

  // Current route (OSRM) data
  currentRouteEtaMin: number;
  currentRouteDistanceKm: number;

  // Mock simulation
  mockSimulation: MockSimulationService | null;
  routePolyline: { latitude: number; longitude: number }[];

  // Actions — connection
  setWsConnected: (connected: boolean) => void;
  hydrate: () => Promise<void>;

  // Actions — go online / offline (emit to socket, mirrored locally)
  goOnline: () => void;
  goOffline: () => void;
  emitLocation: (loc: CurrentLocation) => void;

  // Actions — WS event handlers (called from SocketProvider)
  onRideOffer: (offer: RideRequestDTO, expiresInSec: number) => void;
  onRideCancelled: (rideId: string, by: 'rider' | 'system' | 'driver') => void;
  onRideAssigned: (ride: RideRequestDTO) => void;
  onTripStarted: (rideId: string) => void;
  onTripCompleted: (rideId: string) => void;
  onPaymentReceived: (rideId: string, amount: number) => void;

  // Actions — local phase transitions (called by sheets or after server ack)
  completeCashTrip: (cashCollected: boolean, riderDidNotPay?: boolean) => void;
  confirmCashCollected: () => void;
  reportRiderDidNotPay: () => void;
  payCommission: (rideId: string, paymentMethod: 'wallet' | 'paystack' | 'bank_card') => Promise<boolean>;
  skipCommission: (rideId: string) => void;
  checkOverdueCommissions: () => void;
  addCard: (card: Omit<SavedCard, 'id'>) => void;
  removeCard: (cardId: string) => void;
  processCardPayment: (rideId: string, cardId: string) => Promise<boolean>;
  onCommissionPaymentSuccess: (rideId: string) => void;
  acceptCurrentRide: () => void;
  declineCurrentRide: () => void;
  arrivedAtPickup: () => void;
  startTrip: () => void;
  openTollModal: () => void;
  closeTollModal: () => void;
  acceptToll: (amount: number) => void;
  openCancelReason: () => void;
  closeCancelReason: () => void;
  confirmCancelTrip: (reason: string) => void;
  addTripToHistory: (trip: TripHistoryItemDTO) => void;
  completeTrip: () => Promise<void>;
  resetAfterTrip: () => void;
  triggerNextRide: () => void;

  // Actions — data loading
  refreshEarnings: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loadMoreHistory: () => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<{ success: boolean; error?: string }>;
  addMoney: (amount: number) => Promise<{ success: boolean; error?: string }>;

  // Actions — map + location
  recenterMap: () => void;
  setMapRegion: (r: DriverState['mapRegion']) => void;
  setCurrentLocation: (loc: CurrentLocation) => void;
  markMapCenteredOnce: () => void;
  setLocationPermission: (s: LocationPermission) => void;
  setLocationError: (e: string | null) => void;
  markLocationRequested: () => void;
  setServiceFilter: (f: ServiceFilter) => void;
  setRoutePolyline: (path: { latitude: number; longitude: number }[]) => void;

  // Actions — internal
  clearAllTimers: () => void;
}

const EMPTY_PROFILE: DriverProfileDTO = {
  id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  date_of_birth: '',
  referral_code: '',
  tier: 'Bronze',
  rating: 0,
  is_online: false,
  total_trips: 0,
  total_earnings: 0,
  years_on_platform: 0,
  vehicle: {
    make: '',
    model: '',
    year: 0,
    color: '',
    plate: '',
    type: 'economy',
    seats: 0,
    insurance: { provider: '', policy_number: '', expires: '' },
    inspection: { last_date: '', next_date: '', status: 'pending' },
  },
  documents: {
    birth_certificate: { status: 'missing', expires: 'N/A', reference: null },
    license: { status: 'missing', expires: 'N/A', reference: null },
    passport: { status: 'missing', expires: 'N/A', reference: null },
    insurance: { status: 'missing', expires: 'N/A', reference: null },
    medical: { status: 'missing', expires: 'N/A', reference: null },
  },
  bank: {
    bank_name: '',
    account_holder: '',
    account_number: '',
    routing_number: '',
  } as BankDetailsDTO,
};

const EMPTY_EARNINGS: EarningsDTO = {
  currency: '$',
  weekly_earnings: 0,
  weekly_rides: 0,
  today_earnings: 0,
  today_rides: 0,
  today_minutes: 0,
  acceptance_rate: 0,
  cancellation_rate: 0,
  driver_tier: 'Bronze',
  weekly_breakdown: [],
};

const EMPTY_WALLET: WalletSummaryDTO = {
  currency: '$',
  balance: 0,
  pending_balance: 0,
  lifetime_earnings: 0,
  ledger: [],
};

const DEFAULT_REGION = {
  latitude: 51.5178,
  longitude: -0.0985,
  latitudeDelta: 0.08,
  longitudeDelta: 0.1,
};

const CLEAR_TIMERS: DriverState['timers'] = {
  search: null,
  pulse: null,
  countdown: null,
  arrivedWait: null,
  phaseReset: null,
};

export const useDriverStore = create<DriverState>((set, get) => ({
  isOnline: false,
  isLoading: false,
  phase: 'offline',
  commissionDebts: [],
  accountRestricted: false,
  savedCards: [],
  cashCollected: false,
  riderDidNotPay: false,
  serviceFilter: 'all',
  wsConnected: false,
  searchDurationSec: 0,
  pulseDot: 0,
  currentRide: null,
  countdown: 15,
  arrivedWaitSec: 0,
  tollAmount: 0,
  tollModalOpen: false,
  cancelReasonOpen: false,
  currentTripId: null,
  totalCommissionOwed: 0,
  offers: [],
  earnings: EMPTY_EARNINGS,
  history: [],
  wallet: EMPTY_WALLET,
  profile: EMPTY_PROFILE,
  historyCursor: null,
  historyLoading: false,
  mapRegion: DEFAULT_REGION,
  heatPoints: [],
  surgeZones: [],
  mapRecenterTick: 0,
  currentLocation: null,
  locationPermission: 'idle',
  locationError: null,
  locationRequestedOnce: false,
  mapCenteredOnce: false,
  timers: { ...CLEAR_TIMERS },
  currentRouteEtaMin: 0,
  currentRouteDistanceKm: 0,
  mockSimulation: null,
  routePolyline: [],

  setWsConnected(connected) {
    set({ wsConnected: connected });
  },

  async hydrate() {
    if (isMockMode()) {
      // In mock mode, fall back to a minimal demo profile so the UI is functional.
      set({
        profile: {
          ...EMPTY_PROFILE,
          id: 'mock-driver-001',
          first_name: 'Test',
          last_name: 'Driver',
          email: 'driver@queens.app',
          phone: '+44 7700 900321',
          city: 'London',
          tier: 'Gold',
          rating: 4.92,
          is_online: false,
          total_trips: 1284,
          total_earnings: 18420,
          years_on_platform: 3,
        },
      });
      return;
    }
    try {
      const cached = await secureStorage.getDriverProfile<DriverProfileDTO>();
      if (cached) set({ profile: cached });
    } catch {
      // Secure store unavailable — non-fatal.
    }
    await Promise.all([get().refreshProfile(), get().refreshEarnings(), get().refreshWallet()]);
  },

  goOnline() {
    if (get().isOnline) return;
    get().clearAllTimers();
    set({ isOnline: true, phase: 'searching', searchDurationSec: 0, pulseDot: 0 });
    const loc = get().currentLocation;
    if (loc) {
      const payload = {
        lat: loc.latitude,
        lng: loc.longitude,
        heading: loc.heading ?? null,
        serviceTypes: [get().serviceFilter === 'all' ? 'economy' : get().serviceFilter],
      };
      if (isLocationPayload({ ...payload, ts: Date.now() })) {
        emit(ClientEvents.DriverOnline, payload);
      }
    }
    const search = setInterval(() => {
      set(state => ({
        searchDurationSec: state.searchDurationSec + 1,
        pulseDot: ((state.pulseDot + 1) % 3) as 0 | 1 | 2,
      }));
    }, 1000);
    const pulse = setInterval(() => {
      set(state => ({ pulseDot: ((state.pulseDot + 1) % 3) as 0 | 1 | 2 }));
    }, 600);
    set(state => ({ timers: { ...state.timers, search, pulse } }));

    // Start mock simulation if in mock mode
    if (isMockMode()) {
      const simulation = new MockSimulationService({
        onRideOffer: (ride, expiresInSec) => {
          get().onRideOffer(ride, expiresInSec);
        },
        onPhaseTransition: (phase) => {
          set({ phase });
        },
        onTripComplete: (ride) => {
          // Instead of auto-transition, hold on completion to show payment/commission summary
          set({ phase: 'trip_complete' });
        },
        onLocationUpdate: (loc) => {
          const currentLoc = get().currentLocation;
          get().setCurrentLocation({
            ...currentLoc,
            latitude: loc.latitude,
            longitude: loc.longitude,
            timestamp: Date.now(),
          } as CurrentLocation);
        },
        onRouteUpdate: (path, durationMin, distanceKm) => {
          set({ routePolyline: path, currentRouteEtaMin: durationMin, currentRouteDistanceKm: distanceKm });
        },
      });
      set({ mockSimulation: simulation });
      simulation.start();
    }
  },

  goOffline() {
    get().clearAllTimers();
    
    // Stop mock simulation
    const simulation = get().mockSimulation;
    if (simulation) {
      simulation.stop();
      set({ mockSimulation: null });
    }
    
    emit(ClientEvents.DriverOffline, {});
    set({
      isOnline: false,
      phase: 'offline',
      currentRide: null,
      routePolyline: [],
      currentRouteEtaMin: 0,
      currentRouteDistanceKm: 0,
      searchDurationSec: 0,
      pulseDot: 0,
      countdown: 15,
    });
  },

  emitLocation(_loc) {
    // No-op locally: the SocketProvider subscribes to currentLocation and emits
    // `driver.location` directly. This hook exists so screens can call it for
    // symmetry with other actions without owning socket concerns.
  },

  onRideOffer(offer, expiresInSec) {
    set({
      currentRide: offer,
      countdown: expiresInSec,
      phase: 'incoming_ride',
    });
    get().clearAllTimers();
    const cd = setInterval(() => {
      const next = get().countdown - 1;
      if (next <= 0) {
        get().clearAllTimers();
        set({ phase: 'cancelled', currentRide: null });
        const reset = setTimeout(() => {
          set({
            phase: get().isOnline ? 'searching' : 'offline',
            countdown: 15,
            currentRide: null,
          });
        }, 2500);
        set(state => ({ timers: { ...state.timers, phaseReset: reset } }));
      } else {
        set({ countdown: next });
      }
    }, 1000);
    set(state => ({ timers: { ...state.timers, countdown: cd } }));
  },

  onRideCancelled(rideId, by) {
    const ride = get().currentRide;
    if (!ride || ride.id !== rideId) return;
    get().clearAllTimers();
    set({ phase: 'cancelled', currentRide: null });
    const reset = setTimeout(() => {
      set({
        phase: get().isOnline ? 'searching' : 'offline',
        currentRide: null,
        countdown: 15,
      });
    }, 2500);
    set(state => ({ timers: { ...state.timers, phaseReset: reset } }));
    void by;
  },

  onRideAssigned(ride) {
    set({ currentRide: ride, currentTripId: ride.id, phase: 'driving_to_pickup', countdown: 15 });
  },

  onTripStarted(_rideId) {
    set({ phase: 'in_progress' });
  },

  onTripCompleted(_rideId) {
    set({ phase: 'trip_complete' });
  },

  onPaymentReceived(rideId, _amount) {
    void rideId;
  },

  acceptCurrentRide() {
    const ride = get().currentRide;
    if (!ride) return;
    get().clearAllTimers();
    emit(ClientEvents.RideAccept, { rideId: ride.id });
    set({
      currentRide: ride,
      currentTripId: ride.id,
      phase: 'driving_to_pickup',
      countdown: 15,
    });

    get().recenterMap();

    // Start simulation if in mock mode
    if (isMockMode() && get().mockSimulation) {
      const startLoc = get().currentLocation || { latitude: 6.4550, longitude: 3.3942 };
      get().mockSimulation!.simulateAcceptedRide(ride, startLoc, ride.pickup);
    }
  },

  declineCurrentRide() {
    const ride = get().currentRide;
    get().clearAllTimers();
    if (ride) emit(ClientEvents.RideDecline, { rideId: ride.id, reason: 'driver_declined' });
    set({
      phase: get().isOnline ? 'searching' : 'offline',
      currentRide: null,
      countdown: 15,
      searchDurationSec: 0,
    });
  },

  arrivedAtPickup() {
    const ride = get().currentRide;
    get().clearAllTimers();
    if (ride) emit(ClientEvents.RideArrive, { rideId: ride.id });
    set({ phase: 'arrived', arrivedWaitSec: 0 });
    const t = setInterval(() => {
      set(state => ({ arrivedWaitSec: state.arrivedWaitSec + 1 }));
    }, 1000);
    set(state => ({ timers: { ...state.timers, arrivedWait: t } }));
  },

  startTrip() {
    const ride = get().currentRide;
    get().clearAllTimers();
    if (ride) emit(ClientEvents.RideStart, { rideId: ride.id });
    set({ phase: 'in_progress' });
  },

  openTollModal() {
    set({ tollModalOpen: true });
  },
  closeTollModal() {
    set({ tollModalOpen: false });
  },
  acceptToll(amount) {
    set(state => ({ tollAmount: state.tollAmount + amount, tollModalOpen: false }));
  },

  openCancelReason() {
    set({ cancelReasonOpen: true });
  },
  closeCancelReason() {
    set({ cancelReasonOpen: false });
  },

  confirmCancelTrip(reason) {
    const ride = get().currentRide;
    get().clearAllTimers();
    if (ride) emit(ClientEvents.RideCancel, { rideId: ride.id, reason });
    set({ phase: 'cancelled', currentRide: null });
    const reset = setTimeout(() => {
      set({
        phase: get().isOnline ? 'searching' : 'offline',
        currentRide: null,
        countdown: 15,
      });
    }, 2500);
    set(state => ({ timers: { ...state.timers, phaseReset: reset } }));
  },

  addTripToHistory(trip) {
    set(state => ({
      history: [trip, ...state.history],
    }));
  },

  async completeTrip() {
    const ride = get().currentRide;
    if (!ride) return;

    get().clearAllTimers();

    emit(ClientEvents.RideComplete, {
      rideId: ride.id,
      distanceMeters: Math.round(ride.distance_km * 1000),
      durationSec: Math.round(ride.duration_min * 60),
    });

    const driverEarnings = ride.fare.amount - ride.commissionAmount;

    // Create trip history item
    const historyItem: TripHistoryItemDTO = {
      id: ride.id,
      date: new Date().toISOString(),
      pickup: ride.pickup_address,
      destination: ride.destination_address,
      fare: ride.fare,
      passenger_name: `${ride.passenger.first_name} ${ride.passenger.last_name}`,
      distance_km: ride.distance_km,
      duration_min: ride.duration_min,
      payment_method: ride.paymentMethod,
      status: 'completed',
      commissionStatus: ride.paymentMethod === 'cash' ? 'pending' : 'deducted',
      service_type: 'economy',
    };
    get().addTripToHistory(historyItem);

    if (ride.paymentMethod === 'cash') {
      const debt: CommissionDebtDTO = {
        rideId: ride.id,
        amount: ride.commissionAmount,
        dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      set(state => ({
        commissionDebts: [...state.commissionDebts, debt],
        totalCommissionOwed: state.totalCommissionOwed + ride.commissionAmount,
      }));
    } else {
      // Credit driver wallet with earnings and update global earnings
      set(state => ({
        wallet: {
          ...state.wallet,
          balance: state.wallet.balance + driverEarnings,
          pending_balance: state.wallet.pending_balance + driverEarnings,
          ledger: [
            {
              id: `wl-${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              time: new Date().toTimeString().slice(0, 5),
              description: 'Trip earnings',
              amount: driverEarnings,
              currency: state.wallet.currency,
              type: 'credit' as const,
              category: 'refund' as const,
              status: 'settled' as const,
              reference: `TRIP-${ride.id?.slice(-6)}`,
            },
            ...state.wallet.ledger,
          ],
        },
        earnings: {
          ...state.earnings,
          today_earnings: state.earnings.today_earnings + driverEarnings,
          weekly_earnings: state.earnings.weekly_earnings + driverEarnings,
          today_rides: state.earnings.today_rides + 1,
          weekly_rides: state.earnings.weekly_rides + 1,
        },
        phase: get().isOnline ? 'searching' : 'offline',
        currentRide: null,
        currentTripId: null,
        routePolyline: [],
        currentRouteEtaMin: 0,
        currentRouteDistanceKm: 0,
        countdown: 15,
      }));
      get().triggerNextRide();
    }

    void get().refreshWallet();
    void get().refreshEarnings();
  },

  triggerNextRide() {
    if (isMockMode() && get().mockSimulation) {
      get().mockSimulation!.scheduleNextRide();
    }
  },

  resetAfterTrip() {
    get().clearAllTimers();
    set({
      phase: get().isOnline ? 'searching' : 'offline',
      currentRide: null,
      currentTripId: null,
      routePolyline: [],
      currentRouteEtaMin: 0,
      currentRouteDistanceKm: 0,
      tollAmount: 0,
    });
    get().triggerNextRide();
  },

  async refreshEarnings() {
    if (isMockMode()) {
      set({ isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const data = await tripsAPI.getEarnings('week');
      if (data) set({ earnings: data });
    } catch (err) {
      // Surface in location error slot only if nothing else is shown; earnings
      // errors are silent by default to avoid overloading the dashboard.
      void getApiErrorMessage(err, 'Failed to refresh earnings');
    } finally {
      set({ isLoading: false });
    }
  },

  async refreshWallet() {
    if (isMockMode()) {
      set({ isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const data = await walletAPI.getSummary();
      if (data) {
        set({ wallet: data });
        await secureStorage.setWallet(data);
      }
    } catch (err) {
      void getApiErrorMessage(err, 'Failed to refresh wallet');
    } finally {
      set({ isLoading: false });
    }
  },

  async refreshProfile() {
    if (isMockMode()) return;
    try {
      const data = await driverAPI.getProfile();
      if (data) {
        set({ profile: data });
        await secureStorage.setDriverProfile(data);
      }
    } catch (err) {
      void getApiErrorMessage(err, 'Failed to refresh profile');
    }
  },

  async loadMoreHistory() {
    if (isMockMode()) return;
    if (get().historyLoading) return;
    set({ historyLoading: true });
    try {
      const data = await tripsAPI.getHistory(get().historyCursor ?? undefined);
      if (data) {
        set(state => ({
          history: state.historyCursor ? [...state.history, ...data.trips] : data.trips,
          historyCursor: data.nextCursor,
        }));
      }
    } catch (err) {
      void getApiErrorMessage(err, 'Failed to load trips');
    } finally {
      set({ historyLoading: false });
    }
  },

  async requestWithdrawal(amount) {
    if (amount <= 0) return { success: false, error: 'Invalid amount' };
    if (amount > get().wallet.balance) return { success: false, error: 'Insufficient balance' };
    if (isMockMode()) {
      set(state => ({
        wallet: {
          ...state.wallet,
          balance: state.wallet.balance - amount,
          ledger: [
            {
              id: `wl-${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              time: new Date().toTimeString().slice(0, 5),
              description: `Withdrawal to ${state.profile.bank.bank_name} ${state.profile.bank.account_number.slice(-4)}`,
              amount,
              currency: state.wallet.currency,
              type: 'debit',
              category: 'withdrawal',
              status: 'pending',
              reference: `WD-${Date.now().toString().slice(-6)}`,
            },
            ...state.wallet.ledger,
          ],
        },
      }));
      return { success: true };
    }
    set({ isLoading: true });
    try {
      await walletAPI.requestWithdrawal(amount);
      await get().refreshWallet();
      return { success: true };
    } catch (err) {
      return { success: false, error: getApiErrorMessage(err, 'Withdrawal failed') };
    } finally {
      set({ isLoading: false });
    }
  },

  async addMoney(amount) {
    if (amount <= 0) return { success: false, error: 'Invalid amount' };
    if (isMockMode()) {
      set(state => ({
        wallet: {
          ...state.wallet,
          balance: state.wallet.balance + amount,
          pending_balance: state.wallet.pending_balance + amount,
          ledger: [
            {
              id: `wl-${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              time: new Date().toTimeString().slice(0, 5),
              description: 'Top up from bank',
              amount,
              currency: state.wallet.currency,
              type: 'credit',
              category: 'refund',
              status: 'pending',
              reference: `TP-${Date.now().toString().slice(-6)}`,
            },
            ...state.wallet.ledger,
          ],
        },
      }));
      return { success: true };
    }
    set({ isLoading: true });
    try {
      await walletAPI.topUp(amount, 'card');
      await get().refreshWallet();
      return { success: true };
    } catch (err) {
      return { success: false, error: getApiErrorMessage(err, 'Top-up failed') };
    } finally {
      set({ isLoading: false });
    }
  },

  recenterMap() {
    const loc = get().currentLocation;
    if (loc) {
      set({
        mapRegion: { latitude: loc.latitude, longitude: loc.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
      });
    }
  },

  setMapRegion(r) {
    set({ mapRegion: r });
  },

  setCurrentLocation(loc) {
    set({ currentLocation: loc });
  },

  setLocationPermission(s) {
    set({ locationPermission: s });
  },
  setLocationError(e) {
    set({ locationError: e });
  },
  markLocationRequested() {
    set({ locationRequestedOnce: true });
  },
  markMapCenteredOnce() {
    set({ mapCenteredOnce: true });
  },
  setServiceFilter(f) {
    set({ serviceFilter: f });
  },
  setRoutePolyline(path) {
    set({ routePolyline: path });
  },
  completeCashTrip(cashCollected, riderDidNotPay = false) {
    const ride = get().currentRide;
    if (ride && cashCollected) {
      const driverEarnings = ride.fare.amount - ride.commissionAmount;
      const historyItem: TripHistoryItemDTO = {
        id: ride.id,
        date: new Date().toISOString(),
        pickup: ride.pickup_address,
        destination: ride.destination_address,
        fare: ride.fare,
        passenger_name: `${ride.passenger.first_name} ${ride.passenger.last_name}`,
        distance_km: ride.distance_km,
        duration_min: ride.duration_min,
        payment_method: 'cash',
        status: 'completed',
        commissionStatus: 'pending',
        service_type: 'economy',
      };
      get().addTripToHistory(historyItem);
      
      set(state => ({
        earnings: {
          ...state.earnings,
          today_earnings: state.earnings.today_earnings + driverEarnings,
          weekly_earnings: state.earnings.weekly_earnings + driverEarnings,
          today_rides: state.earnings.today_rides + 1,
          weekly_rides: state.earnings.weekly_rides + 1,
        }
      }));
    }
    set({ cashCollected, riderDidNotPay });
    set({
      phase: get().isOnline ? 'searching' : 'offline',
      currentRide: null,
      currentTripId: null,
      routePolyline: [],
      currentRouteEtaMin: 0,
      currentRouteDistanceKm: 0,
      countdown: 15,
    });
    get().triggerNextRide();
  },
  confirmCashCollected() {
    set({ cashCollected: true, phase: 'trip_complete' });
  },
  reportRiderDidNotPay() {
    set({ riderDidNotPay: true });
    // Record as no-show or cancelled
    if (get().currentRide) {
      const ride = get().currentRide!;
      get().addTripToHistory({
        id: ride.id,
        date: new Date().toISOString(),
        pickup: ride.pickup_address,
        destination: ride.destination_address,
        fare: ride.fare,
        passenger_name: `${ride.passenger.first_name} ${ride.passenger.last_name}`,
        distance_km: ride.distance_km,
        duration_min: ride.duration_min,
        payment_method: ride.paymentMethod,
        status: 'cancelled',
        commissionStatus: 'waived',
        service_type: 'economy',
      });
    }
    set({
      phase: get().isOnline ? 'searching' : 'offline',
      currentRide: null,
      currentTripId: null,
      routePolyline: [],
      currentRouteEtaMin: 0,
      currentRouteDistanceKm: 0,
      countdown: 15,
    });
    get().triggerNextRide();
  },
  async payCommission(rideId, method) {
    const ride = get().currentRide;
    const debt = get().commissionDebts.find(d => d.rideId === rideId);
    const commissionAmount = ride?.commissionAmount || debt?.amount || 0;

    if (method === 'wallet') {
      const balance = get().wallet.balance;
      if (balance < commissionAmount) {
        return false;
      }
      set(state => ({
        wallet: {
          ...state.wallet,
          balance: state.wallet.balance - commissionAmount,
          ledger: [
            ...state.wallet.ledger,
            {
              id: `wl-${Date.now()}`,
              date: new Date().toISOString().slice(0, 10),
              time: new Date().toTimeString().slice(0, 5),
              description: 'Commission deducted',
              amount: -commissionAmount,
              currency: state.wallet.currency,
              type: 'debit' as const,
              category: 'commission' as const,
              status: 'settled' as const,
              reference: `COM-${rideId?.slice(-6)}`,
            },
          ],
        },
      }));
    }

    // bank_card method — no wallet deduction, just mark paid
    // (real integration would process via Paystack/Stripe)

    set(state => ({
      commissionDebts: state.commissionDebts.filter(d => d.rideId !== rideId),
      totalCommissionOwed: Math.max(0, state.totalCommissionOwed - commissionAmount),
    }));

    return true;
  },
  skipCommission(rideId) {
    set(state => ({
      commissionDebts: state.commissionDebts.map(d =>
        d.rideId === rideId ? { ...d, status: 'overdue' as const } : d
      ),
      accountRestricted: true,
    }));
  },
  checkOverdueCommissions() {
    set({ commissionDebts: [], totalCommissionOwed: 0, accountRestricted: false });
  },
  addCard(card) {
    const newCard: SavedCard = {
      id: `card-${Date.now()}`,
      ...card,
    };
    set(state => ({
      savedCards: [...state.savedCards, newCard],
    }));
  },
  removeCard(cardId) {
    set(state => ({
      savedCards: state.savedCards.filter(c => c.id !== cardId),
    }));
  },
  async processCardPayment(rideId, cardId) {
    // Mock: simulate card payment success
    await new Promise(r => setTimeout(r, 500));
    return get().payCommission(rideId, 'bank_card');
  },
  onCommissionPaymentSuccess(rideId) {
    const ride = get().currentRide;
    const commissionAmount = ride?.commissionAmount || 0;
    set(state => ({
      commissionDebts: state.commissionDebts.filter(d => d.rideId !== rideId),
      totalCommissionOwed: Math.max(0, state.totalCommissionOwed - commissionAmount),
    }));
  },
  clearAllTimers() {
    const t = get().timers;
    if (t.search) clearInterval(t.search);
    if (t.pulse) clearInterval(t.pulse);
    if (t.countdown) clearInterval(t.countdown);
    if (t.arrivedWait) clearInterval(t.arrivedWait);
    if (t.phaseReset) clearTimeout(t.phaseReset);
    set({ timers: { ...CLEAR_TIMERS } });
  },
}));

// Re-export DTO-derived types for selectors.
export type { ServiceType };


