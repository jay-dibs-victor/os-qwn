import { useCallback } from 'react';
import { useAuthStore, SignupDraft } from '@/store/auth';

export const useAuth = () => {
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const loading = useAuthStore(s => s.loading);
  const error = useAuthStore(s => s.error);
  const loginAction = useAuthStore(s => s.login);
  const registerAction = useAuthStore(s => s.register);
  const logoutAction = useAuthStore(s => s.logout);
  const clearError = useAuthStore(s => s.clearError);

  const handleLogin = useCallback(
    async (input: { email: string; password: string; lat?: number; lng?: number }) => {
      const result = await loginAction(input.email, input.password, {
        lat: input.lat,
        lng: input.lng,
      });
      return result;
    },
    [loginAction],
  );

  const handleRegister = useCallback(
    async (input: { name: string; email: string; phone: string; password: string }) => {
      const [firstname, ...rest] = input.name.split(' ');
      const lastname = rest.join(' ');
      const username = input.email.split('@')[0] ?? 'driver';
      const draft: SignupDraft = {
        email: input.email,
        password: input.password,
        firstname: firstname || 'Driver',
        lastname,
        username,
        phoneNumber: input.phone,
      };
      return registerAction(draft);
    },
    [registerAction],
  );

  const handleLogout = useCallback(async () => {
    await logoutAction();
    return { success: true as const };
  }, [logoutAction]);

  return {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  };
};
