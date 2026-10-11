/**
 * useBookingStore — taxibooking-userapp
 * Domain store for the user booking flow: step, active booking, itinerary, payment.
 * Replaces this.state in class components and window.location.href navigation.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useBookingStore = create(
  devtools(
    (set, get) => ({
      // ── Booking flow step ─────────────────────────────────────
      bookingStep: 'idle',   // 'idle' | 'selecting' | 'confirming' | 'paying' | 'tracking' | 'done'
      setBookingStep: (step) => set({ bookingStep: step }),
      resetBookingFlow: () => set({ bookingStep: 'idle', activeBooking: null, itinerary: null }),

      // ── Active booking ────────────────────────────────────────
      activeBooking: null,
      setActiveBooking: (booking) => set({ activeBooking: booking }),
      clearActiveBooking: () => set({ activeBooking: null }),

      // ── Itinerary (pickup / destination) ─────────────────────
      itinerary: null,   // { origin: { address, lat, lng }, destination: { address, lat, lng } }
      setItinerary: (itinerary) => set({ itinerary }),
      clearItinerary: () => set({ itinerary: null }),

      // ── Map state ─────────────────────────────────────────────
      mapCenter: { lat: 6.5244, lng: 3.3792 },
      setMapCenter: (center) => set({ mapCenter: center }),

      // ── Payment flow ──────────────────────────────────────────
      paymentMethod: 'wallet',   // 'wallet' | 'card' | 'cash'
      setPaymentMethod: (method) => set({ paymentMethod: method }),

      // ── History filter ────────────────────────────────────────
      historyFilter: 'all',
      setHistoryFilter: (filter) => set({ historyFilter: filter }),

      // ── Search ────────────────────────────────────────────────
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      // ── Real-time Socket State ────────────────────────────────
      driverLocation: null, // [lat, lng]
      driverTrail: [], // [[lat, lng], [lat, lng], ...]
      chatHistory: [],
      currentRideStatus: 'IDLE', // 'SEARCHING' | 'ACCEPTED' | 'ARRIVED' | 'STARTED' | 'COMPLETED'
      
      updateDriverLocation: (loc) => set((state) => ({ 
         driverLocation: loc,
         driverTrail: [...state.driverTrail, loc]
      })),
      addChatMessage: (msg) => set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
      updateRideStatus: (status) => set({ currentRideStatus: status }),

      // ── Competitive Features ──────────────────────────────────
      savedPlaces: [], // [{ label, address, lat, lng }]
      setSavedPlaces: (places) => set({ savedPlaces: places }),
      
      emergencyContacts: [], // [{ name, phone, email }]
      setEmergencyContacts: (contacts) => set({ emergencyContacts: contacts }),
      
      referralCode: '',
      setReferralCode: (code) => set({ referralCode: code }),
      
      searchHistory: [], // [string]
      voucherBalance: '0.00',
      updateVoucherBalance: (bal) => set({ voucherBalance: bal }),
      addSearchHistory: (query) => set((s) => ({
        searchHistory: [query, ...s.searchHistory.filter(q => q !== query)].slice(0, 5)
      })),
    }),
    { name: 'BookingStore' },
  ),
);
