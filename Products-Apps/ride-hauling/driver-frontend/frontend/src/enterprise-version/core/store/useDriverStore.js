/**
 * useDriverStore — queens-driverapp
 * Domain store for driver-specific state: active trip, map position, online status.
 * Replaces scattered this.state in class components and vanilla JS DOM manipulation.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useDriverStore = create(
  devtools(
    (set, get) => ({
      // ── Driver online/offline toggle ───────────────────────────
      isOnline: false,
      toggleOnlineStatus: () => set((s) => ({ isOnline: !s.isOnline })),

      // ── Active trip ────────────────────────────────────────────
      activeTrip: null,
      setActiveTrip: (trip) => set({ activeTrip: trip }),
      clearActiveTrip: () => set({ activeTrip: null }),

      // ── Map state ──────────────────────────────────────────────
      currentPosition: null,   // { lat, lng }
      setCurrentPosition: (position) => set({ currentPosition: position }),

      mapCenter: { lat: 6.5244, lng: 3.3792 },  // Default: Lagos
      setMapCenter: (center) => set({ mapCenter: center }),

      // ── Vehicles tracked on map (replaces this.state.vehicles in map.js) ──
      vehicles: [],
      addVehicle: (vehicle) =>
        set((s) => ({ vehicles: [...s.vehicles, vehicle] })),
      clearVehicles: () => set({ vehicles: [] }),

      // ── Selected filter for trip tables ───────────────────────
      tripFilter: 'all',   // 'all' | 'completed' | 'upcoming'
      setTripFilter: (filter) => set({ tripFilter: filter }),

      // ── Search query for trip/history tables ──────────────────
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
    }),
    { name: 'DriverStore' },
  ),
);
