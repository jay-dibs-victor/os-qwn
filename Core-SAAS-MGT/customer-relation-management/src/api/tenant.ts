export function getTenantIdFromHost(hostname: string): string | undefined {
  const envTenantId = import.meta.env.VITE_TENANT_ID as string | undefined
  
  // Always use env tenant ID for localhost/development
  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('localhost:') ||
    hostname.startsWith('127.0.0.1:') ||
    hostname.endsWith('.localhost')

  if (isLocalhost) {
    console.log('🏠 Using localhost tenant ID from env:', envTenantId)
    return envTenantId
  }

  // For production, extract from subdomain
  const labels = hostname.split('.').filter(Boolean)
  if (labels.length >= 3) {
    console.log('🌐 Using production tenant ID from subdomain:', labels[0])
    return labels[0]
  }

  console.log('⚙️ Fallback to env tenant ID:', envTenantId)
  return envTenantId
}

export function getTenantId(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const tenantId = getTenantIdFromHost(window.location.hostname)
  console.log('📍 getTenantId() returning:', tenantId, 'for hostname:', window.location.hostname)
  return tenantId
}

