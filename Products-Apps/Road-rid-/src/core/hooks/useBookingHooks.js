import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useBookingStore } from '../store/useBookingStore';
import apiClient from '../api/apiClient';

/**
 * useBookingHooks — taxibooking-userapp
 */

export const useRideRequests = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['ride-history', user?.id || user?._id],
    queryFn: async () => {
      const { data } = await apiClient.get('/rides/history');
      return data.data || [];
    },
    enabled: !!user,
  });
};

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const setStep = useBookingStore((state) => state.setBookingStep);

  return useMutation({
    mutationFn: async (rideData) => {
      const { data } = await apiClient.post('/rides/request', rideData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride-history'] });
      addToast('Ride requested! Searching for nearby drivers...', 'success');
      // setStep('tracking'); // Plan.jsx handles this locally
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to request ride', 'danger');
    },
  });
};

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await apiClient.get('/plans');
      return data.data || [];
    }
  });
};

export const useCars = () => {
  return useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const { data } = await apiClient.get('/cars');
      return data.data || [];
    }
  });
};

export const useCancelRideMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);
  const resetFlow = useBookingStore((state) => state.resetBookingFlow);

  return useMutation({
    mutationFn: async (rideId) => {
      const { data } = await apiClient.put('/rides/status', { ride_id: rideId, status: 'CANCELLED' });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride-history'] });
      addToast('Ride cancelled', 'info');
      resetFlow();
    },
  });
};
