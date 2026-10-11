import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/apiClient';

/**
 * useSOSHooks — taxibooking-userapp
 * Manages fetching user SOS history.
 */
export const useSOSHistory = () => {
    const user = useAuthStore((state) => state.user);

    return useQuery({
        queryKey: ['sos-history', user?.id || user?._id],
        queryFn: async () => {
            const id = user.id || user._id;
            // Corrected from /sos/user/:id to /sos/:id/users based on sos_routes.ts
            const { data } = await apiClient.get(`/sos/${id}/users`);
            return data.data || [];
        },
        enabled: !!user,
    });
};

/**
 * useNotificationHooks — taxibooking-userapp
 * Manages fetching and marking user notifications.
 */
export const useNotifications = () => {
    const user = useAuthStore((state) => state.user);

    return useQuery({
        queryKey: ['notifications', user?.id || user?._id],
        queryFn: async () => {
            const id = user.id || user._id;
            const { data } = await apiClient.get(`/notifications/${id}`);
            return data.data || [];
        },
        enabled: !!user,
    });
};
