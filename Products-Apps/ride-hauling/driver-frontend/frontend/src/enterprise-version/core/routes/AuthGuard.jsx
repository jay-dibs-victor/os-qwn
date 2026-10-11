import React, { useEffect, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { decryptPayload, getSSOCookie } from '../helpers/ssoHelper';

const DRIVER_ROLES = ['Individual Driver', 'Courier Driver', 'driver'];

/**
 * isDriverRole — checks if a user object has a valid driver role.
 * Handles both string and array formats.
 */
const isDriverRole = (user) => {
  if (!user) return false;
  const raw = user.roles || user.role || '';
  const roleStr = Array.isArray(raw) ? raw.join(',') : String(raw);
  return DRIVER_ROLES.some((r) => roleStr.includes(r));
};

/**
 * AuthGuard — queens-driverapp
 * Three layers of protection:
 * 1. SSO payload in URL — decrypt, set session, strip URL.
 * 2. Role check — only users with driver roles can access the portal.
 * 3. Token presence — redirect unauthenticated users to login.
 */
const AuthGuard = () => {
  const { token, user, setSession } = useAuthStore();
  const location = useLocation();

  // ── SSO Bootstrap: runs synchronously before rendering ──────────────────
  // We run this outside useEffect so the first render can already use
  // the hydrated session (avoiding a flash-redirect to login).
  const ssoHydrated = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const ssoPayload = params.get('sso_payload');
    if (ssoPayload) {
      try {
        const data = decryptPayload(ssoPayload);
        if (data?.token && data?.user) {
          setSession(data.user, data.token);
          // Strip the sensitive param from the URL
          window.history.replaceState({}, '', window.location.pathname);
          return { user: data.user, token: data.token };
        }
      } catch (e) {
        console.error('SSO payload decryption failed:', e);
      }
    }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once per mount

  // Also try shared cookie as a last-resort fallback
  useEffect(() => {
    if (!token) {
      const cookieToken = getSSOCookie();
      if (cookieToken) {
        // Token exists in cookie but not in store — user likely opened a new tab.
        // We can't reconstruct the user object from the cookie alone without an API call,
        // so we just allow the standard login flow to take over.
      }
    }
  }, [token]);

  const effectiveUser  = ssoHydrated?.user  || user;
  const effectiveToken = ssoHydrated?.token || token;

  // ── Not authenticated at all ─────────────────────────────────────────────
  if (!effectiveToken) {
    return <Navigate to="/login" replace />;
  }

  // ── Authenticated but wrong role ─────────────────────────────────────────
  if (!isDriverRole(effectiveUser)) {
    // Clear any stale non-driver session so they can log in correctly
    useAuthStore.getState().logout();
    return <Navigate to="/previledges-denied" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
