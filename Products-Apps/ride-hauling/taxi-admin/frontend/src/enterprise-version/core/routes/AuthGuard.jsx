import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

/**
 * AuthGuard — taxi-admin
 * Ensures only authenticated admins can access protected routes.
 */
const AuthGuard = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Check if authenticated AND if the user has admin role/privilege
  // Some apps use user.is_admin, others use user.user_type === 'admin'
  const isAdmin = user?.is_admin || user?.user_type === 'admin' || user?.roles?.includes('admin');

  if (!isAuthenticated || !token || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
