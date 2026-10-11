import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

/**
 * useAuthHooks — taxibooking-userapp
 */

export const useUserLoginMutation = () => {
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
      addToast('Welcome to Queens!', 'success');
      navigate('/dashboard');
    },
    onError: (error) => {
      addToast(error.message || 'Login failed', 'danger');
    },
  });
};

export const useUserRegisterMutation = () => {
  const register = useAuthStore((state) => state.register);
  const addToast = useUIStore((state) => state.addToast);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (userData) => {
      const result = await register(userData);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      addToast('Account created! Welcome aboard.', 'success');
      navigate('/dashboard');
    },
    onError: (error) => {
      addToast(error.message || 'Registration failed', 'danger');
    },
  });
};


