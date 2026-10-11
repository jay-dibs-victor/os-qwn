/**
 * useUIStore — taxi-admin
 * Replaces: jQuery DOM toggling, loader, sidebar, notification badge mutations across admin views
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useUIStore = create(
  devtools(
    (set, get) => ({
      // ── Loader ─────────────────────────────────────────────────
      loaderVisible: true,
      hideLoader: () => set({ loaderVisible: false }),
      showLoader: () => set({ loaderVisible: true }),

      // ── Sidebar collapse state ─────────────────────────────────
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      collapseSidebar: () => set({ sidebarCollapsed: true }),
      expandSidebar: () => set({ sidebarCollapsed: false }),

      // ── Notification badge ─────────────────────────────────────
      notificationCount: 0,
      setNotificationCount: (count) => set({ notificationCount: count }),
      decrementNotificationCount: () =>
        set((s) => ({ notificationCount: Math.max(0, s.notificationCount - 1) })),

      // ── Modals ─────────────────────────────────────────────────
      activeModal: null,
      modalData: null,
      openModal: (modalId, data = null) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // ── Detail view toggle (replaces first-view/second-view DOM switch) ──
      detailView: false,
      selectedEntityId: null,
      showDetail: (id) => set({ detailView: true, selectedEntityId: id }),
      hideDetail: () => set({ detailView: false, selectedEntityId: null }),

      // ── Toast / Alerts ─────────────────────────────────────────
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 4500);
      },
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    { name: 'AdminUIStore' },
  ),
);
