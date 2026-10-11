import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to validate that the URL tenant ID matches the JWT tenant ID
 * Redirects to login if there's a mismatch (security check)
 */
export function useTenantValidation() {
  const { tenantId: urlTenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const jwtTenantId = useAuthStore((s) => s.tenantId);

  useEffect(() => {
    // Only validate if we have both IDs
    if (!urlTenantId || !jwtTenantId) return;

    // Check if URL tenant ID matches JWT tenant ID
    if (urlTenantId !== jwtTenantId) {
      console.error('❌ Tenant ID mismatch:', { urlTenantId, jwtTenantId });
      // Redirect to login for security
      setTimeout(() => navigate('/login'), 1000);
    }
  }, [urlTenantId, jwtTenantId, navigate]);

  return {
    isValid: !urlTenantId || !jwtTenantId || urlTenantId === jwtTenantId,
    urlTenantId,
    jwtTenantId,
  };
}
