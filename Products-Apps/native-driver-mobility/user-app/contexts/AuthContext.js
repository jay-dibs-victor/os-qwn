import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { storage } from '../lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const session = await storage.getSession();
        if (session?.token) {
          setToken(session.token);
          setUser(session.user);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.login({ username, password });
    setToken(res.token);
    setUser(res.user);
    await storage.saveSession(res.token, res.user);
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.register(data);
    const fakeToken = 'qtk_' + Math.random().toString(36).slice(2);
    setToken(fakeToken);
    setUser(res.user);
    await storage.saveSession(fakeToken, res.user);
    await storage.saveProfile(res.user);
    return res;
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await api.updateUser(data);
    setUser(prev => ({ ...prev, ...res }));
    await storage.saveProfile({ ...user, ...res });
    return res;
  }, [user]);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await storage.clearSession();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
