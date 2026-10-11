import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import apiClient from '../api/apiClient';

/**
 * useProfileHooks — queens-driverapp
 */

export const useProfile = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ['profile', user?.id || user?._id],
    queryFn: async () => {
      const id = user.id || user._id;
      const { data } = await apiClient.get(`/drivers-profile/update/${id}`);
      return data.data;
    },
    enabled: !!user,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (profileData) => {
      const id = user.id || user._id;
      const { data } = await apiClient.post(`/drivers-profile/update/${id}`, profileData);
      return data;
    },
    onSuccess: (data) => {
      updateUser(data.data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      addToast('Profile updated successfully', 'success');
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to update profile', 'danger');
    },
  });
};

export const useWalletBalance = () => {
  const user = useAuthStore((state) => state.user);
  const setWalletBalance = useUIStore((state) => state.setWalletBalance);

  return useQuery({
    queryKey: ['wallet-balance', user?.email],
    queryFn: async () => {
      const { data } = await apiClient.get(`/balance/${user.email}`);
      const balance = data.data?.[0]?.accountBalance || '0.00';
      setWalletBalance(balance);
      return balance;
    },
    enabled: !!user?.email,
  });
};
