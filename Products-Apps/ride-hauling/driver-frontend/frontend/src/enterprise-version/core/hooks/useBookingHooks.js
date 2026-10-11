import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import apiClient from '../api/apiClient';

/**
 * useBookingHooks — queens-driverapp
 * Hooks for driver-specific itinerary/trip management.
 */

export const useItineraries = () => {
  const user = useAuthStore((state) => state.user);
  
  return useQuery({
    queryKey: ['itineraries', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const id = user.email; // Backend expects email for this specific query
      // Use driver-specific endpoint (registered in driver_routes.ts)
      const { data } = await apiClient.get(`/drivers-assigned-user-trips/${id}`);
      // Backend returns { data: [{ tripsInfo: [...], message }] }
      return data.data?.[0]?.tripsInfo || data.data || [];
    },
    enabled: !!user?.email,
  });
};

export const useUpdateItineraryStatusMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await apiClient.put(`/itinerary/${id}/status`, { status });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
      addToast(`Trip marked as ${variables.status.toLowerCase()}`, 'success');
    },
    onError: () => {
      addToast('Failed to update trip status', 'danger');
    },
  });
};

export const useCompletedTrips = () => {
  const itineraries = useItineraries();
  return {
    ...itineraries,
    data: itineraries.data?.filter(item => item.status === 'completed') || []
  };
};

export const useUpcomingTrips = () => {
  const itineraries = useItineraries();
  return {
    ...itineraries,
    data: itineraries.data?.filter(item => item.status === 'upcoming' || item.status === 'pending') || []
  };
};

export const useAcceptRideMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (rideId) => {
      const { data } = await apiClient.post('/rides/accept', { 
        ride_id: rideId, 
        driver_id: user.id || user._id 
      });
      return data;
    },
    onSuccess: () => {
      addToast('Ride accepted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'Failed to accept ride', 'danger');
    }
  });
};

export const useUpdateRideStatusMutation = () => {
  const addToast = useUIStore((state) => state.addToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.put('/rides/status', payload);
      return data;
    },
    onSuccess: (_, vars) => {
      addToast(`Status updated to ${vars.status}`, 'success');
      queryClient.invalidateQueries({ queryKey: ['tripDetail'] });
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'Status update failed', 'danger');
    }
  });
};

export const useTripDetail = (id) => {
  return useQuery({
    queryKey: ['tripDetail', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const { data } = await apiClient.get(`/rides/${id}`);
        return data.data || data;
      } catch (e) {
        console.warn('Ride detail fetch failed, trying itinerary:', e);
        const { data } = await apiClient.get(`/itinerary/${id}/user`);
        return data.data;
      }
    },
    enabled: !!id
  });
};

export const useAssignedCars = () => {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ['assignedCars', user?.email],
    queryFn: async () => {
      const { data } = await apiClient.get(`/drivers-assigned-cars/${user.email}`);
      return data.data?.[0]?.carsInfo || data.data || [];
    },
    enabled: !!user?.email
  });
};

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);
  return useMutation({
    mutationFn: async ({ id, is_available }) => {
      const { data } = await apiClient.put(`/drivers-availability/${id}`, { is_available });
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      addToast(`Availability updated to ${vars.is_available ? 'Online' : 'Offline'}`, 'info');
    }
  });
};

export const useSettlePaymentMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post('/rides/settle-payment', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tripDetail'] });
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'Payment settlement failed', 'danger');
    }
  });
};

export const useVerifyCompletionMutation = () => {
  const addToast = useUIStore((state) => state.addToast);
  return useMutation({
    mutationFn: async ({ ride_id, code }) => {
      const { data } = await apiClient.post('/rides/verify-completion', { ride_id, code });
      return data;
    },
    onError: (err) => {
      addToast(err.response?.data?.error || 'Invalid completion code', 'danger');
    }
  });
};
