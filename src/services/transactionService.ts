import apiClient from '../api/apiClient';

export type TransactionType = 'reward' | 'mining' | 'referral';
export type TransactionStatus = 'mining' | 'claimed' | 'withdrawn';

export type TransactionItem = {
  id: string;
  userId: string;
  type: TransactionType;
  title: string;
  amount: number;
  status: TransactionStatus;
  date: string;
  isCredit: boolean;
};

type TransactionHistoryResponse = {
  success: boolean;
  data: TransactionItem[];
};

type GetHistoryFilters = {
  type?: 'all' | TransactionType;
  status?: 'all' | TransactionStatus;
};

export const transactionService = {
  async getHistory(filters?: GetHistoryFilters): Promise<TransactionItem[]> {
    const params: Record<string, string> = {};

    if (filters?.type && filters.type !== 'all') {
      params.type = filters.type;
    }

    if (filters?.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    const response = await apiClient.get<TransactionHistoryResponse>(
      '/transactions/history',
      { params }
    );

    return Array.isArray(response.data?.data) ? response.data.data : [];
  },
};
