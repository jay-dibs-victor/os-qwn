import client from './client';
import type { WalletLedgerEntryDTO, WalletSummaryDTO } from './dto';

function unwrap<T>(envelope: { data: T }): T {
  return envelope.data;
}

export interface LedgerPage {
  entries: WalletLedgerEntryDTO[];
  nextCursor: string | null;
}

export const walletAPI = {
  getSummary: async (): Promise<WalletSummaryDTO> => {
    const res = await client.get<{ status: number; data: WalletSummaryDTO }>('/wallet/summary');
    return unwrap(res).data;
  },

  requestWithdrawal: async (amount: number, currency = 'USD'): Promise<WalletSummaryDTO> => {
    const res = await client.post<{ status: number; data: WalletSummaryDTO }>('/wallet/withdraw', {
      amount,
      currency,
    });
    return unwrap(res).data;
  },

  topUp: async (amount: number, method: 'card' | 'bank', currency = 'USD'): Promise<WalletSummaryDTO> => {
    const res = await client.post<{ status: number; data: WalletSummaryDTO }>('/wallet/topup', {
      amount,
      method,
      currency,
    });
    return unwrap(res).data;
  },

  getLedger: async (cursor?: string, limit = 25): Promise<LedgerPage> => {
    const res = await client.get<{
      status: number;
      data: { entries: WalletLedgerEntryDTO[]; nextCursor: string | null };
    }>('/wallet/ledger', {
      params: { cursor, limit },
    });
    return unwrap(res).data;
  },
};
