import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

/**
 * useAuthHooks — queens-driverapp
 * Mutations for login, signup, and password recovery.
 */

export const useLoginMutation = () => {
  const login = useAuthStore((state) => state.login);
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials) => {
      const result = await login(credentials);
      return result;
    },
    onSuccess: (result) => {
      if (result.success) {
        addToast('Login successful!', 'success');
        navigate('/dashboard');
      } else if (result.requiresVerification) {
        addToast('Verification required.', 'info');
        // We'll navigate them to verify in the component if needed, or stick to a generic path
      } else {
        addToast(result.error || 'Login failed', 'danger');
      }
    },
    onError: (error) => {
      addToast(error.message || 'Login failed', 'danger');
    },
  });
};

export const useSignupMutation = () => {
  const register = useAuthStore((state) => state.register);
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (userData) => {
      return await register(userData);
    },
    onSuccess: (result) => {
      if (result.success) {
        addToast('Registration successful!', 'success');
      } else {
        addToast(result.error || 'Registration failed', 'danger');
      }
    },
    onError: (error) => {
      addToast(error.message || 'Registration failed', 'danger');
    },
  });
};

export const useForgotPasswordMutation = () => {
  const addToast = useUIStore((state) => state.addToast);

  return useMutation({
    mutationFn: async (email) => {
      const { data } = await apiClient.post('/auth/drivers-forgot_password', { email });
      return data;
    },
    onSuccess: () => {
      addToast('Recovery email sent. Check your inbox.', 'success');
    },
    onError: (error) => {
      addToast(error.response?.data?.error || 'Failed to send recovery email', 'danger');
    },
  });
};
