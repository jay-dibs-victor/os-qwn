/**
 * useUIStore — queens-driverapp
 * Replaces: all jQuery show/hide, animate, loader, notification badge DOM mutations from FrontEndApp
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useUIStore = create(
  devtools(
    (set, get) => ({
      // ── Loader (replaces #loader jQuery animate) ───────────────
      loaderVisible: true,
      hideLoader: () => set({ loaderVisible: false }),
      showLoader: () => set({ loaderVisible: true }),

      // ── Sidebar / Nav ──────────────────────────────────────────
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),

      // ── Notification badge (replaces innerHTML on #notifyCount) ─
      notificationCount: 0,
      setNotificationCount: (count) => set({ notificationCount: count }),
      decrementNotificationCount: () =>
        set((s) => ({ notificationCount: Math.max(0, s.notificationCount - 1) })),

      // ── Wallet balance (replaces innerHTML on #balance-seen) ────
      walletBalance: '0.00',
      setWalletBalance: (balance) => set({ walletBalance: balance }),

      // ── Toast notifications ─────────────────────────────────────
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 4000);
      },
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    { name: 'DriverUIStore' },
  ),
);
