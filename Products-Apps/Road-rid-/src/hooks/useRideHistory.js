import { useState, useCallback } from 'react';

const STORAGE_KEY = 'queens_os_ride_history';

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useRideHistory() {
  const [history, setHistory] = useState(loadHistory);

  const saveRide = useCallback((ride) => {
    const entry = {
      ...ride,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      completedAt: new Date().toISOString(),
    };
    const updated = [entry, ...loadHistory()].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
    return entry;
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  const getRideById = useCallback((id) => {
    return loadHistory().find((r) => r.id === id) || null;
  }, []);

  const updateLastRideRating = useCallback((rating) => {
    const all = loadHistory();
    if (all.length === 0) return;
    all[0] = { ...all[0], rating };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    setHistory(all);
  }, []);

  return { history, saveRide, clearHistory, getRideById, updateLastRideRating };
}
