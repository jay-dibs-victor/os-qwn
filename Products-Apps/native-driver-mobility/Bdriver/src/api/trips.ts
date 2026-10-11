import client from './client';
import type { EarningsDTO, TripHistoryItemDTO } from './dto';

function unwrap<T>(envelope: { data: T }): T {
  return envelope.data;
}

export interface TripHistoryPage {
  trips: TripHistoryItemDTO[];
  nextCursor: string | null;
}

export const tripsAPI = {
  getHistory: async (cursor?: string, limit = 20): Promise<TripHistoryPage> => {
    const res = await client.get<{
      status: number;
      data: { trips: TripHistoryItemDTO[]; nextCursor: string | null };
    }>('/trips', { params: { cursor, limit } });
    return unwrap(res).data;
  },

  getById: async (id: string): Promise<TripHistoryItemDTO> => {
    const res = await client.get<{ status: number; data: TripHistoryItemDTO }>(`/trips/${id}`);
    return unwrap(res).data;
  },

  cancel: async (id: string, reason: string): Promise<{ status: number; message: string }> => {
    const res = await client.post<{ status: number; message: string }>(`/trips/${id}/cancel`, {
      reason,
    });
    return unwrap(res);
  },

  rate: async (id: string, stars: number, comment?: string): Promise<{ status: number; message: string }> => {
    const res = await client.post<{ status: number; message: string }>(`/trips/${id}/rate`, {
      stars,
      comment,
    });
    return unwrap(res);
  },

  getEarnings: async (period: 'day' | 'week' | 'month'): Promise<EarningsDTO> => {
    const res = await client.get<{ status: number; data: EarningsDTO }>('/trips/earnings', {
      params: { period },
    });
    return unwrap(res).data;
  },
};
