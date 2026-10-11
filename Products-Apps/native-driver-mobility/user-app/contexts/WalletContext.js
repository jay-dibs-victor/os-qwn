import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { storage } from '../lib/storage';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(6500);
  const [coins, setCoins] = useState(12);
  const [surgeTokens, setSurgeTokens] = useState(3);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.getWallet();
        if (saved) {
          setBalance(saved.balance ?? 6500);
          setCoins(saved.coins ?? 12);
          setSurgeTokens(saved.surgeTokens ?? 3);
          setTransactions(saved.transactions ?? []);
        } else {
          const data = await api.getUserWallet();
          setBalance(data.balance);
          setTransactions(data.transactions);
        }
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (b, c, s, t) => {
    await storage.saveWallet({ balance: b, coins: c, surgeTokens: s, transactions: t });
  }, []);

  const topUp = useCallback(async (amount) => {
    const res = await api.topUpWallet(amount);
    setBalance(res.newBalance);
    const txn = { id: 'txn_' + Date.now(), type: 'topup', merchant: 'Wallet Top Up', amount, date: new Date().toISOString().split('T')[0], status: 'completed' };
    const updated = [txn, ...transactions];
    setTransactions(updated);
    await persist(res.newBalance, coins, surgeTokens, updated);
    return res;
  }, [balance, coins, surgeTokens, transactions, persist]);

  const deduct = useCallback(async (amount) => {
    setBalance(prev => Math.max(0, prev - amount));
    const txn = { id: 'txn_' + Date.now(), type: 'payment', merchant: 'Ride Payment', amount: -amount, date: new Date().toISOString().split('T')[0], status: 'completed' };
    const updated = [txn, ...transactions];
    setTransactions(updated);
    await persist(Math.max(0, balance - amount), coins, surgeTokens, updated);
  }, [balance, coins, surgeTokens, transactions, persist]);

  const addCoins = useCallback(async (count) => {
    const newCoins = coins + count;
    setCoins(newCoins);
    await persist(balance, newCoins, surgeTokens, transactions);
  }, [balance, coins, surgeTokens, transactions, persist]);

  const useSurgeToken = useCallback(() => {
    if (surgeTokens <= 0) return false;
    setSurgeTokens(prev => prev - 1);
    persist(balance, coins, surgeTokens - 1, transactions);
    return true;
  }, [balance, coins, surgeTokens, transactions, persist]);

  return (
    <WalletContext.Provider value={{ balance, coins, surgeTokens, transactions, loading, topUp, deduct, addCoins, useSurgeToken, setSurgeTokens }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
