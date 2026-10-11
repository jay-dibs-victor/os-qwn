/**
 * useAdminStore — taxi-admin
 * Domain store for admin panel UI state: selected entity, pagination, filters.
 * Replaces: document.getElementById show/hide toggling between first-view & second-view,
 * and inline data-id DOM attribute reads across all 24 admin modules.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useAdminStore = create(
  devtools(
    (set, get) => ({
      // ── Selected entity detail (replaces first/second view DOM switch) ──
      selectedEntity: null,          // the full object being viewed/edited
      selectedEntityType: null,      // 'user' | 'driver' | 'booking' | 'car' | etc.
      viewMode: 'list',              // 'list' | 'detail' | 'edit' | 'create'

      selectEntity: (entity, type) =>
        set({ selectedEntity: entity, selectedEntityType: type, viewMode: 'detail' }),
      editEntity: (entity, type) =>
        set({ selectedEntity: entity, selectedEntityType: type, viewMode: 'edit' }),
      createEntity: (type) =>
        set({ selectedEntity: null, selectedEntityType: type, viewMode: 'create' }),
      backToList: () =>
        set({ selectedEntity: null, viewMode: 'list' }),

      // ── Pagination ────────────────────────────────────────────
      currentPage: 1,
      pageSize: 10,
      setPage: (page) => set({ currentPage: page }),
      setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),

      // ── Search / Filter ───────────────────────────────────────
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),

      activeFilter: 'all',
      setActiveFilter: (filter) => set({ activeFilter: filter, currentPage: 1 }),

      // ── Map state (admin map tracker) ─────────────────────────
      mapCenter: { lat: 6.5244, lng: 3.3792 },
      setMapCenter: (center) => set({ mapCenter: center }),

      // ── Confirm dialog ────────────────────────────────────────
      confirmDialog: null,   // { message, onConfirm, onCancel }
      openConfirm: (config) => set({ confirmDialog: config }),
      closeConfirm: () => set({ confirmDialog: null }),
    }),
    { name: 'AdminStore' },
  ),
);
