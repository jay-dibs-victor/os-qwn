import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import apiClient from '../api/apiClient';

/**
 * useNotificationHooks — queens-driverapp
 */

export const useNotifications = () => {
  const user = useAuthStore((state) => state.user);
  const setNotificationCount = useUIStore((state) => state.setNotificationCount);

  return useQuery({
    queryKey: ['notifications', user?.id || user?._id],
    queryFn: async () => {
      const id = user.id || user._id;
      // Use driver-specific endpoint
      const { data } = await apiClient.get(`/drivers-notifications/${id}`);
      const list = data.data || [];
      setNotificationCount(list.filter(n => !n.isRead).length);
      return list;
    },
    enabled: !!user,
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();
  const decrementCount = useUIStore((state) => state.decrementNotificationCount);

  return useMutation({
    mutationFn: async (notifId) => {
      // For drivers, we should ideally have a specific endpoint, 
      // but if not, we use the standard one. 
      // However, /notification-update/:id was found to be Admin-only in some cases.
      // We'll keep it as as is or use the driver one if it exists.
      // Based on driver_routes.ts, only GET and POST exist for /drivers-notifications.
      // So we'll stick to the standard one but keep in mind the potential 403.
      const { data } = await apiClient.put(`/notification-update/${notifId}`, { isRead: true });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      decrementCount();
    },
  });
};
