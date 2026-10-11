import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

/**
 * useAuthHooks — taxi-admin
 */

export const useAdminLoginMutation = () => {
  const login = useAuthStore((state) => state.login);
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials) => {
      const result = await login(credentials);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      addToast('Welcome back, Admin!', 'success');
      navigate('/dashboard');
    },
    onError: (error) => {
      addToast(error.message || 'Login failed', 'danger');
    },
  });
};

export const useAdminForgotPasswordMutation = () => {
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (email) => {
      const { data } = await apiClient.post('/auth/forgot_password', { email });
      return data;
    },
    onSuccess: () => {
      addToast('Recovery instructions sent to email', 'success');
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to send recovery email', 'danger');
    },
  });
};
