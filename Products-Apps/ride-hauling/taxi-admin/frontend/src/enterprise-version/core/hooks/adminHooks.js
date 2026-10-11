import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD & ANALYTICS
───────────────────────────────────────────────────────────────── */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin');
      return data;
    },
    staleTime: 60000, // 1 minute
  });
};

export const useAdminAnalytics = (period = '7days') => {
  return useQuery({
    queryKey: ['admin', 'analytics', period],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin-analytics?period=${period}`);
      return data;
    },
    staleTime: 300000, // 5 minutes
  });
};

export const useSalesAnalytics = (period = 'today') => {
  return useQuery({
    queryKey: ['admin', 'sales', period],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin-sales-${period}`);
      return data;
    },
  });
};

/* ─────────────────────────────────────────────────────────────────
   USER MANAGEMENT
───────────────────────────────────────────────────────────────── */
export const useUsersAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-users');
      return data.users || data;
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      await apiClient.delete(`/users/${userId}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

/* ─────────────────────────────────────────────────────────────────
   DRIVER MANAGEMENT
───────────────────────────────────────────────────────────────── */
export const useDriversAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'drivers'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-drivers');
      return data.drivers || data;
    },
  });
};

export const useApproveDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (driverId) => {
      await apiClient.patch(`/admin-drivers/${driverId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (driverId) => {
      await apiClient.delete(`/admin-drivers-mgt/${driverId}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, driverData }) => {
      const { data } = await apiClient.put(`/admin-drivers-detail/${id}`, driverData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
    },
  });
};

export const useAddDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (driverData) => {
      const { data } = await apiClient.post('/admin-add-driver', driverData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] });
    },
  });
};

/* ─────────────────────────────────────────────────────────────────
   BOOKING & RIDE LOGISTICS
───────────────────────────────────────────────────────────────── */
export const useBookingsAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-bookings');
      return data.bookings || data;
    },
  });
};

export const useLogisticsStats = () => {
  return useQuery({
    queryKey: ['admin', 'logistics-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/rides/logistics-stats');
      return data;
    },
  });
};

/* ─────────────────────────────────────────────────────────────────
   CRUD MUTATIONS
───────────────────────────────────────────────────────────────── */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userData }) => {
      const { data } = await apiClient.put(`/admin-users-detail/${id}`, userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await apiClient.post('/admin-add-user', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

/* ─────────────────────────────────────────────────────────────────
   ADMIN & ROLE MANAGEMENT
───────────────────────────────────────────────────────────────── */
export const useAdminsAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'admins'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-admins');
      return data.admins || data;
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adminId) => {
      await apiClient.delete(`/admin-admins/${adminId}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, adminData }) => {
      const { data } = await apiClient.put(`/admin-admins-update/${id}`, adminData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
    },
  });
};

export const useAddAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adminData) => {
      const { data } = await apiClient.post('/admin-add-admin', adminData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
    },
  });
};

/* ─────────────────────────────────────────────────────────────────
   FLEET & ASSET MANAGEMENT
───────────────────────────────────────────────────────────────── */
export const useCarsAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'cars'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-cars-mgt');
      return data.cars || data;
    },
  });
};

export const useInspectionsAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'inspections'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-inspection'); 
      return data.inspections || data;
    },
  });
};

export const useDeleteCar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (carId) => {
      await apiClient.delete(`/admin-cars-mgt/${carId}/delete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cars'] });
    },
  });
};
/* ─────────────────────────────────────────────────────────────────
   RBAC & PRIVILEGE MANAGEMENT
   Mappings to system roles and granular permissions
   Endpoints: /admin-previledges, /add-roles, /admin-assign-role
───────────────────────────────────────────────────────────────── */
export const usePrivilegesAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'privileges'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-previledges');
      return data.priviledges || data;
    },
  });
};

export const useAddRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roleData) => {
      const { data } = await apiClient.post('/add-roles', roleData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'privileges'] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, roleData }) => {
      const { data } = await apiClient.put(`/admin-previledges-update/${id}`, roleData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'privileges'] });
    },
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentData) => {
      const { data } = await apiClient.post('/admin-assign-role', assignmentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useUserPrivileges = (userId) => {
  return useQuery({
    queryKey: ['admin', 'user-privileges', userId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/get-admin-previledges/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};

/* ─────────────────────────────────────────────────────────────────
   PARTNER & EARNINGS MANAGEMENT
───────────────────────────────────────────────────────────────── */
export const usePartnersAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'partners'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-partners');
      return data.partners || data;
    },
  });
};

export const useEarningsAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'earnings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-earnings');
      return data.earnings || data;
    },
  });
};

export const useAddPartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partnerData) => {
      const { data } = await apiClient.post('/add-partner', partnerData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
    },
  });
};

export const useFaqsAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'faqs'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-faqs'); 
      return data.faqs || data;
    },
  });
};

export const useTicketsAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-tickets');
      return data.tickets || data;
    },
  });
};

export const useFeedbackAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'feedback'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-feedback');
      return data.feedbacks || data;
    },
  });
};

export const useTechSupportAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'tech-support'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-tech-support');
      return data.support_requests || data;
    },
  });
};

export const useEnquiriesAdmin = () => {
  return useQuery({
    queryKey: ['admin', 'enquiries'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-enquiries');
      return data.enquiries || data;
    },
  });
};

export const useAuditLogs = (filters) => {
  return useQuery({
    queryKey: ['admin', 'audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const { data } = await apiClient.get(`/admin-logs?${params}`);
      return data.logs || data || [];
    },
    staleTime: 30000,
  });
};

export const useAvailablePermissions = () => {
  return useQuery({
    queryKey: ['admin', 'available-permissions'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-previledges');
      const roles = data.priviledges || data;
      if (!roles || roles.length === 0) return [];
      
      const firstRole = roles[0];
      const permissionKeys = Object.keys(firstRole).filter(key => 
        key.startsWith('view_') || key.startsWith('manage_')
      );
      
      return permissionKeys;
    },
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin-notifications');
      return data.notifications || data || [];
    },
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ message, target }) => {
      const { data } = await apiClient.post('/admin-send-notification', { message, target });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });
};
