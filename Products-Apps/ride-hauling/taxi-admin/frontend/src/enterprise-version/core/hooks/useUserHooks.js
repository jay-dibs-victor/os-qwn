import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../store/useUIStore';
import apiClient from '../api/apiClient';

/**
 * useAdminUserHooks — taxi-admin
 * Management for Users, Drivers, Admins, and Partners.
 */

// ── Users ──────────────────────────────────────────────────
export const useUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-users');
      return data.data || [];
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async ({ id, userData }) => {
      const { data } = await apiClient.put(`/admin-users-detail/${id}`, userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      addToast('User updated successfully', 'success');
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (id) => {
      await apiClient.delete(`/users/${id}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      addToast('User deleted', 'warning');
    },
  });
};

// ── Drivers ────────────────────────────────────────────────
export const useDrivers = () => {
  return useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-drivers');
      return data.data || [];
    },
  });
};

export const useAddDriverMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (driverData) => {
      const { data } = await apiClient.post('/add-driver', driverData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
      addToast('Driver added successfully', 'success');
    },
  });
};

// ── Admins ─────────────────────────────────────────────────
export const useAdmins = () => {
  return useQuery({
    queryKey: ['admin-admins'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-admins');
      return data.data || [];
    },
  });
};

export const useAddAdminMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (adminData) => {
      const { data } = await apiClient.post('/add-admin', adminData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-admins'] });
      addToast('New admin created', 'success');
    },
  });
};

// ── Single User ───────────────────────────────────────────
export const useUser = (id) => {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get(`/admin-users-detail/${id}`);
      return data.data || null;
    },
    enabled: !!id,
  });
};
