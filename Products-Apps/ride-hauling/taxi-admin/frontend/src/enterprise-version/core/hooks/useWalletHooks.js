import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../store/useUIStore';
import apiClient from '../api/apiClient';

/**
 * useWalletHooks — taxi-admin
 * Wallet Transactions, Payments, Quotations, Plans.
 */

export const usePaymentHistory = () => {
  return useQuery({
    queryKey: ['admin-payment-history'],
    queryFn: async () => {
      const { data } = await apiClient.get('/payment-history');
      return data.data || [];
    },
  });
};

export const useQuotations = () => {
  return useQuery({
    queryKey: ['admin-quotations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/payment-quotations');
      return data.data || [];
    },
  });
};

export const usePlans = () => {
  return useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-plan-package');
      return data.data || [];
    },
  });
};

export const useAddPlanMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (planData) => {
      const { data } = await apiClient.post('/add-plan', planData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      addToast('Subscription plan created', 'success');
    },
  });
};
