import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { storage } from '../lib/storage';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [rides, setRides] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userData, rideData, notifData] = await Promise.all([
        api.getUser(),
        api.getUserRides(),
        api.getNotifications(),
      ]);
      setProfile(userData);
      setRides(rideData.rides);
      setNotifications(notifData);
      await storage.saveProfile(userData);
    } catch { setError('Failed to load your data. Pull down to retry.'); }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateRides = useCallback(async () => {
    const res = await api.getUserRides();
    setRides(res.rides);
  }, []);

  const markNotificationsRead = useCallback(async () => {
    await api.markNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  return (
    <UserContext.Provider value={{ profile, rides, notifications, loading, error, refresh, updateRides, markNotificationsRead }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
