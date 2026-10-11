import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import apiClient from '../api/apiClient';
import { soundService } from '../services/SoundService';

/**
 * useProfileHooks — taxibooking-userapp
 */

export const useUserProfile = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['user-profile', user?.id || user?._id],
    queryFn: async () => {
      const id = user.id || user._id;
      const { data } = await apiClient.get(`/profile/update/${id}`);
      return data.data;
    },
    enabled: !!user,
  });
};

export const useUserWalletBalance = () => {
  const user = useAuthStore((state) => state.user);
  const setWalletBalance = useUIStore((state) => state.setWalletBalance);

  return useQuery({
    queryKey: ['user-wallet', user?.email],
    queryFn: async () => {
      const { data } = await apiClient.get(`/balance/${user.email}`);
      const balance = data.data?.[0]?.accountBalance || '0.00';
      setWalletBalance(balance);
      return balance;
    },
    enabled: !!user?.email,
  });
};

export const useWalletHistory = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['wallet-history', user?.email],
    queryFn: async () => {
      try {
        // Corrected from /wallet/history/ to /payment-history/
        // The backend uses email as the identifier in this route
        const { data } = await apiClient.get(`/payment-history/${user.email}`);
        return data.data || [];
      } catch (err) {
        // Fallback for UI robustness
        return [];
      }
    },
    enabled: !!user?.email,
  });
};

export const useActivityMatrix = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['activity-matrix', user?.id || user?._id],
    queryFn: async () => {
      const id = user.id || user._id;
      const { data } = await apiClient.get(`/activity-logs/${id}`);
      return data.data || [];
    },
    enabled: !!user,
  });
};

export const useTopUpWalletMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ amount, lat, lng, gateway = 'paystack' }) => {
      // Use the generic initiate endpoint to support multi-currency
      const { data } = await apiClient.post(`/payments/${gateway}/initiate`, { 
        amount, 
        lat, 
        lng,
        metadata: { lat, lng }
      });
      return data; // returns gateway specific initiation data (e.g. authorization_url or client_secret)
    },
    onSuccess: (data) => {
      soundService.playCoin();
      // Support Paystack/Flutterwave redirect
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      } 
      // Support Stripe client secret (if handled in modal)
      else if (data.data?.client_secret) {
        console.log('Stripe client secret received:', data.data.client_secret);
      }
    },
    onError: () => {
      addToast('Failed to initiate top-up', 'danger');
    },
  });
};
