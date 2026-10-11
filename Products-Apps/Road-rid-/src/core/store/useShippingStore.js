import { create } from 'zustand';

export const useShippingStore = create((set) => ({
  shipments: [],
  currentShipment: null,
  isLoading: false,
  error: null,

  // New shipment form state
  newShipment: {
    origin: { address: '', coordinates: [0, 0] },
    destination: { address: '', coordinates: [0, 0] },
    packages: [{ description: '', weight: 1, dimensions: { length: 10, width: 10, height: 10, unit: 'cm' }, quantity: 1 }],
    customerDetails: { name: '', email: '', phone: '' },
    carrier: 'INTERNAL'
  },

  setNewShipment: (updates) => set((state) => ({
    newShipment: { ...state.newShipment, ...updates }
  })),

  setShipments: (shipments) => set({ shipments }),
  setCurrentShipment: (shipment) => set({ currentShipment: shipment }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  resetNewShipment: () => set({
    newShipment: {
      origin: { address: '', coordinates: [0, 0] },
      destination: { address: '', coordinates: [0, 0] },
      packages: [{ description: '', weight: 1, dimensions: { length: 10, width: 10, height: 10, unit: 'cm' }, quantity: 1 }],
      customerDetails: { name: '', email: '', phone: '' },
      carrier: 'INTERNAL'
    }
  })
}));
