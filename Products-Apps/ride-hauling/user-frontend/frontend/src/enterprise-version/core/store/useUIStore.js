/**
 * useUIStore — taxibooking-userapp
 * Replaces: jQuery show/hide, loader, notification badge DOM mutations
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useUIStore = create(
  devtools(
    (set, get) => ({
      loaderVisible: true,
      hideLoader: () => set({ loaderVisible: false }),
      showLoader: () => set({ loaderVisible: true }),

      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),

      notificationCount: 0,
      setNotificationCount: (count) => set({ notificationCount: count }),
      decrementNotificationCount: () =>
        set((s) => ({ notificationCount: Math.max(0, s.notificationCount - 1) })),

      walletBalance: '0.00',
      setWalletBalance: (balance) => set({ walletBalance: balance }),

      // Pending redirect after auth — used by AuthModal to navigate post-login
      pendingRedirect: null,
      setPendingRedirect: (path) => set({ pendingRedirect: path }),
      clearPendingRedirect: () => set({ pendingRedirect: null }),

      isAuthModalOpen: false,
      authModalView: 'login', // 'login', 'signup', 'forgot'
      openAuthModal: (view = 'login', redirectPath = null) => set({
        isAuthModalOpen: true,
        authModalView: view,
        pendingRedirect: redirectPath,
      }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),



      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 4000);
      },
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    { name: 'UserUIStore' },
  ),
);
