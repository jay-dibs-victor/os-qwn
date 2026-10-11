import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../store/useUIStore';
import apiClient from '../api/apiClient';

/**
 * useSupportHooks — taxi-admin
 * Tickets, SOS, Enquiries, FAQ, Feedback, Mechanic Requests.
 */

export const useTickets = () => {
  return useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-tickets');
      return data.data || [];
    },
  });
};

export const useSOSAlerts = () => {
  return useQuery({
    queryKey: ['admin-sos'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-sos');
      return data.data || [];
    },
  });
};

export const useFaqs = () => {
  return useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-faqs');
      return data.data || [];
    },
  });
};

export const useMechRequests = () => {
  return useQuery({
    queryKey: ['admin-mech'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-mech');
      return data.data || [];
    },
  });
};

export const useDeleteTicketMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (id) => {
      await apiClient.delete(`/tickets/${id}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      addToast('Ticket removed', 'warning');
    },
  });
};
