import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../store/useUIStore';
import apiClient from '../api/apiClient';

/**
 * useAdminBookingHooks — taxi-admin
 * Bookings, Itineraries, Manual Bookings.
 */

export const useBookings = () => {
  return useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-bookings');
      return data.data || [];
    },
  });
};

export const useUpdateBookingStatusMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await apiClient.put(`/itin-status/${id}/update`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      addToast('Booking status updated', 'success');
    },
  });
};

export const useManualBookingMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (bookingData) => {
      const { data } = await apiClient.post('/admin-manual-booking', bookingData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      addToast('Manual booking created', 'success');
    },
  });
};

export const useItineraries = () => {
  return useQuery({
    queryKey: ['admin-itineraries'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-itineraries');
      return data.data || [];
    },
  });
};
