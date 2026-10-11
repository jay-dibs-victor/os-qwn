import { create } from 'zustand';

export const useFlightStore = create((set) => ({
  searchParams: {
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    adults: 1,
    travelClass: 'ECONOMY',
    tripType: 'one-way', // 'one-way' | 'round-trip' | 'multi-city'
  },

  // Multi-city legs: [{ origin, destination, departureDate }]
  multiCityLegs: [
    { origin: '', destination: '', departureDate: '' },
    { origin: '', destination: '', departureDate: '' },
  ],

  flights: [],
  selectedFlight: null,
  isLoading: false,
  error: null,
  cart: [],

  setSearchParams: (params) => set((state) => ({
    searchParams: { ...state.searchParams, ...params }
  })),

  setMultiCityLegs: (legs) => set({ multiCityLegs: legs }),

  updateMultiCityLeg: (index, updates) => set((state) => {
    const legs = [...state.multiCityLegs];
    legs[index] = { ...legs[index], ...updates };
    return { multiCityLegs: legs };
  }),

  addMultiCityLeg: () => set((state) => ({
    multiCityLegs: [...state.multiCityLegs, { origin: '', destination: '', departureDate: '' }]
  })),

  removeMultiCityLeg: (index) => set((state) => ({
    multiCityLegs: state.multiCityLegs.filter((_, i) => i !== index)
  })),

  setFlights: (flights) => set({ flights }),

  selectFlight: (flight) => set({ selectedFlight: flight }),

  addToCart: (flight) => set((state) => {
    const already = state.cart.some(f => f.id === flight.id);
    if (already) return state;
    return { cart: [...state.cart, flight] };
  }),

  removeFromCart: (flightId) => set((state) => ({
    cart: state.cart.filter(f => f.id !== flightId)
  })),

  clearCart: () => set({ cart: [] }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
