import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUIStore } from '../store/useUIStore';
import apiClient from '../api/apiClient';

/**
 * useFleetHooks — taxi-admin
 * Fleet management: Cars and Inspection.
 */

export const useCars = () => {
  return useQuery({
    queryKey: ['admin-cars'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-cars-mgt');
      return data.data || [];
    },
  });
};

export const useAddCarMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (carData) => {
      const { data } = await apiClient.post('/add-cars', carData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cars'] });
      addToast('Car added to fleet', 'success');
    },
  });
};

export const useInspections = () => {
  return useQuery({
    queryKey: ['admin-inspections'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-inspection');
      return data.data || [];
    },
  });
};

export const useAddInspectionMutation = () => {
  const queryClient = useQueryClient();
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (inspectionData) => {
      const { data } = await apiClient.post('/add-inspection', inspectionData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inspections'] });
      addToast('Inspection record created', 'success');
    },
  });
};
