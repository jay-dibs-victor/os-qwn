import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../api/apiClient';

/**
 * useSupportHooks — queens-driverapp
 */

export const useSOSMutation = () => {
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (sosData) => {
      // Corrected from /red-flags to /drivers-sos
      const { data } = await apiClient.post('/drivers-sos', sosData);
      return data;
    },
    onSuccess: () => {
      addToast('SOS alert sent to authorities!', 'danger');
    },
    onError: () => {
      addToast('Failed to send SOS alert', 'danger');
    },
  });
};

export const useMechanicRequestMutation = () => {
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (requestData) => {
      // Corrected from /add-mechanic-request to /mechanic-request
      const { data } = await apiClient.post('/mechanic-request', requestData);
      return data;
    },
    onSuccess: () => {
      addToast('Mechanic request submitted', 'success');
    },
    onError: () => {
      addToast('Failed to submit mechanic request', 'danger');
    },
  });
};

export const useTicketMutation = () => {
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (ticketData) => {
      // Corrected from /add-ticket to /feedback (Intervention routes)
      const { data } = await apiClient.post('/feedback', ticketData);
      return data;
    },
    onSuccess: () => {
      addToast('Ticket submitted successfully', 'success');
    },
    onError: () => {
      addToast('Failed to submit ticket', 'danger');
    },
  });
};

export const useFaqs = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      // Corrected from /admin-faqs (admin-only) to /faqs (public/user)
      const { data } = await apiClient.get('/faqs');
      return data.data || [];
    },
  });
};
