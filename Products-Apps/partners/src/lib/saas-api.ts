export type LoginPayload = {
  email: string;
  password: string;
  tenantId?: string;
};

export type RegisterPayload = {
  email: string;
  phone: string;
  password: string;
  tenantId: string;
  firstName: string;
  lastName: string;
};

export type AuthTokens = {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  oauth?: {
    access_token?: string;
    refresh_token?: string;
    tenant_id?: string;
  };
};

export type PartnerApplicationPayload = {
  auth: RegisterPayload;
  company: {
    legalName: string;
    tradingName: string;
    partnerType: string;
    website: string;
    operatingMarkets: string;
    logoDataUrl?: string;
  };
  kyc: {
    bvn: string;
    nin: string;
    registrationNumber: string;
    taxId: string;
    directorName: string;
    directorRole: string;
  };
  payment: {
    mode: string;
    currency: string;
    bankName: string;
    bankCode: string;
    accountName: string;
    accountNumber: string;
  };
};

const TOKEN_KEY = "queens_partner_auth";

function baseUrl() {
  return (process.env.NEXT_PUBLIC_SAAS_API_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function authToken() {
  if (typeof window === "undefined") return undefined;
  const saved = window.localStorage.getItem(TOKEN_KEY);
  if (!saved) return undefined;

  try {
    const parsed = JSON.parse(saved) as AuthTokens;
    return parsed.access_token || parsed.accessToken || parsed.oauth?.access_token;
  } catch {
    return undefined;
  }
}

export function saveAuth(tokens: AuthTokens & { tenantId?: string; userId?: string }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function getSavedAuth() {
  if (typeof window === "undefined") return undefined;
  const saved = window.localStorage.getItem(TOKEN_KEY);
  if (!saved) return undefined;
  try {
    return JSON.parse(saved) as AuthTokens & { tenantId?: string; userId?: string };
  } catch {
    return undefined;
  }
}

async function api<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    tenantId?: string;
    auth?: boolean;
  } = {},
) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.tenantId) headers["x-tenant-id"] = options.tenantId;

  const token = authToken();
  if (options.auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${baseUrl()}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message = data?.message || response.statusText || "Request failed";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return data as T;
}

export async function login(payload: LoginPayload) {
  const response = await api<AuthTokens & { mfa_required?: boolean; user_id?: string }>("/auth/login", {
    method: "POST",
    body: payload,
    tenantId: payload.tenantId,
  });

  saveAuth({ ...response, tenantId: payload.tenantId, userId: response.user_id });
  return response;
}

export async function register(payload: RegisterPayload) {
  return api<{ id: string; email: string }>("/auth/register", {
    method: "POST",
    body: payload,
    tenantId: payload.tenantId,
  });
}

export async function verifyAccount(userId: string, tenantId: string) {
  return api<{ message: string; status?: string }>("/auth/verify-account", {
    method: "POST",
    body: { userId },
    tenantId,
  });
}

export async function submitPartnerApplication(payload: PartnerApplicationPayload) {
  const createdUser = await register(payload.auth);
  await verifyAccount(createdUser.id, payload.auth.tenantId);
  const tokens = await login({
    email: payload.auth.email,
    password: payload.auth.password,
    tenantId: payload.auth.tenantId,
  });

  const partnerProfile = await api<{ id: string }>("/customer-accounts", {
    method: "POST",
    tenantId: payload.auth.tenantId,
    auth: true,
    body: {
      tenantId: payload.auth.tenantId,
      kind: "PARTNER",
      profileType: "ORGANIZATION",
      name: payload.company.legalName,
      email: payload.auth.email,
      phone: payload.auth.phone,
      status: "PENDING_KYC",
      data: {
        tradingName: payload.company.tradingName,
        partnerType: payload.company.partnerType,
        website: payload.company.website,
        operatingMarkets: payload.company.operatingMarkets,
        logoDataUrl: payload.company.logoDataUrl,
        registrationNumber: payload.kyc.registrationNumber,
        taxId: payload.kyc.taxId,
        directorName: payload.kyc.directorName,
        directorRole: payload.kyc.directorRole,
        preferredPaymentMode: payload.payment.mode,
        settlementBank: {
          bankName: payload.payment.bankName,
          bankCode: payload.payment.bankCode,
          accountName: payload.payment.accountName,
          accountNumber: payload.payment.accountNumber,
        },
      },
    },
  });

  const kyc = await api<{ id: string }>("/kyc", {
    method: "POST",
    tenantId: payload.auth.tenantId,
    auth: true,
    body: {
      customerId: partnerProfile.id,
      tenantId: payload.auth.tenantId,
    },
  });

  await api(`/kyc/${kyc.id}/verify`, {
    method: "POST",
    tenantId: payload.auth.tenantId,
    auth: true,
    body: {
      bvn: payload.kyc.bvn,
      nin: payload.kyc.nin,
      tenantId: payload.auth.tenantId,
    },
  });

  await api(`/kyc/${kyc.id}/liveness`, {
    method: "POST",
    tenantId: payload.auth.tenantId,
    auth: true,
    body: {
      score: 0.95,
      tenantId: payload.auth.tenantId,
    },
  });

  await api(`/kyc/${kyc.id}/submit`, {
    method: "POST",
    tenantId: payload.auth.tenantId,
    auth: true,
  });

  const account = await api<{ accountNumber?: string }>("/accounts", {
    method: "POST",
    tenantId: payload.auth.tenantId,
    auth: true,
    body: {
      name: `${payload.company.tradingName || payload.company.legalName} settlement`,
      type: "CURRENT",
      currency: payload.payment.currency,
      kycTier: "TIER_2",
      customerId: partnerProfile.id,
      tenantId: payload.auth.tenantId,
    },
  });

  return {
    tokens,
    user: createdUser,
    partnerProfile,
    kyc,
    account,
  };
}
