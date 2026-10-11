import client from './client';
import type { AxiosProgressEvent } from 'axios';
import type {
  BankDetailsDTO,
  DriverProfileDTO,
  VehicleDTO,
} from './dto';

export interface OnboardingDraft {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  referralCode?: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    type: 'economy' | 'business' | 'premium';
    seats: number;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    expires: string;
  };
  bank: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    routingNumber: string;
  };
  documents: {
    license: { uri: string; name: string; type: string } | null;
    insurance: { uri: string; name: string; type: string } | null;
    inspection: { uri: string; name: string; type: string } | null;
    selfie: { uri: string; name: string; type: string } | null;
    backgroundCheck: { uri: string; name: string; type: string } | null;
  };
}

export type OnboardingStatus = 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OnboardingResponse {
  status: number;
  message: string;
  data: {
    userId: string | number;
    onboardingId: string;
    status: OnboardingStatus;
  };
}

export interface VettingStatusResponse {
  status: number;
  data: {
    status: OnboardingStatus;
    adminVerified: boolean;
    submittedAt: string;
    reviewedAt?: string | null;
    notes?: string | null;
  };
}

/**
 * The backend returns envelopes of the form `{ status, data, message }`.
 * The helpers below unwrap to the inner payload so callers can work with the
 * domain DTO directly.
 */
function unwrap<T>(envelope: { data: T }): T {
  return envelope.data;
}

function asFormData(draft: OnboardingDraft): FormData {
  const form = new FormData();
  form.append('firstName', draft.firstName);
  form.append('lastName', draft.lastName);
  form.append('email', draft.email);
  form.append('phone', draft.phone);
  form.append('dateOfBirth', draft.dateOfBirth);
  form.append('address', draft.address);
  form.append('city', draft.city);
  if (draft.referralCode) form.append('referralCode', draft.referralCode);
  form.append('vehicle', JSON.stringify(draft.vehicle));
  form.append('insurance', JSON.stringify(draft.insurance));
  form.append('bank', JSON.stringify(draft.bank));

  const appendFile = (
    key: 'license' | 'insurance' | 'inspection' | 'selfie' | 'backgroundCheck',
    file: OnboardingDraft['documents'][typeof key] | null,
  ) => {
    if (!file) return;
    form.append(`document.${key}`, {
      uri: file.uri,
      name: file.name,
      type: file.type,
      // Cast: React Native's FormData accepts a string-cast object that
      // axios interprets as a file descriptor on mobile.
    } as unknown as Blob);
  };
  appendFile('license', draft.documents.license);
  appendFile('insurance', draft.documents.insurance);
  appendFile('inspection', draft.documents.inspection);
  appendFile('selfie', draft.documents.selfie);
  appendFile('backgroundCheck', draft.documents.backgroundCheck);

  return form;
}

export const driverAPI = {
  submitOnboarding: async (
    draft: OnboardingDraft,
    onProgress?: (p: AxiosProgressEvent) => void,
  ): Promise<OnboardingResponse['data']> => {
    const res = await client.post<OnboardingResponse>(
      '/driver/onboarding',
      asFormData(draft),
      {
        headers: { 'content-type': 'multipart/form-data' },
        onUploadProgress: onProgress,
        timeout: 120_000,
      },
    );
    return unwrap(res).data;
  },

  pollVettingStatus: async (): Promise<VettingStatusResponse['data']> => {
    const res = await client.get<VettingStatusResponse>('/driver/vetting/status');
    return unwrap(res).data;
  },

  getProfile: async (): Promise<DriverProfileDTO> => {
    const res = await client.get<{ status: number; data: DriverProfileDTO }>('/driver/profile');
    return unwrap(res).data;
  },

  updateProfile: async (patch: Partial<DriverProfileDTO>): Promise<DriverProfileDTO> => {
    const res = await client.put<{ status: number; data: DriverProfileDTO }>('/driver/profile', patch);
    return unwrap(res).data;
  },

  updateVehicle: async (patch: Partial<VehicleDTO>): Promise<VehicleDTO> => {
    const res = await client.put<{ status: number; data: VehicleDTO }>('/driver/vehicle', patch);
    return unwrap(res).data;
  },

  updateBank: async (patch: Partial<BankDetailsDTO>): Promise<BankDetailsDTO> => {
    const res = await client.put<{ status: number; data: BankDetailsDTO }>('/driver/bank', patch);
    return unwrap(res).data;
  },

  uploadDocument: async (
    kind: 'license' | 'insurance' | 'inspection' | 'selfie' | 'backgroundCheck',
    file: { uri: string; name: string; type: string },
  ): Promise<{ status: number; message: string }> => {
    const form = new FormData();
    form.append('document', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
    const res = await client.post<{ status: number; message: string }>(
      `/driver/documents/${kind}`,
      form,
      { headers: { 'content-type': 'multipart/form-data' }, timeout: 120_000 },
    );
    return unwrap(res);
  },
};
