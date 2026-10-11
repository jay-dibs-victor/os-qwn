import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../store/useUIStore';
import apiClient from '../api/apiClient';

/**
 * useSettingsHooks — taxi-admin
 * API Keys, Platform Settings, RBAC Roles.
 */

export const useGoogleSettings = () => {
  return useQuery({
    queryKey: ['settings-google'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-settings-google');
      return data.data;
    },
  });
};

export const usePaystackSettings = () => {
  return useQuery({
    queryKey: ['settings-paystack'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-settings-paystack');
      return data.data;
    },
  });
};

export const usePreviledges = () => {
  return useQuery({
    queryKey: ['admin-previledges'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-previledges');
      return data.data || [];
    },
  });
};

export const useUpdateSettingsMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ id, settingsData }) => {
      const { data } = await apiClient.put(`/admin-settings-detail/${id}`, settingsData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-google'] });
      queryClient.invalidateQueries({ queryKey: ['settings-paystack'] });
      addToast('Settings updated', 'success');
    },
  });
};
