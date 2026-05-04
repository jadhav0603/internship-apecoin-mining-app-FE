import apiClient from '../api/apiClient';

export type TransactionType = 'reward' | 'mining' | 'referral';
export type TransactionStatus = 'pending' | 'claimed' | 'withdrawn';

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

export type TransactionHistorySummaryPoint = {
  day: string;
  totalMining: number;
  totalReward: number;
  totalReferral: number;
  totalWithdrawal: number;
};

export type TransactionHistorySummary = {
  month: string;
  points: TransactionHistorySummaryPoint[];
  availableMonths: string[];
  totals: {
    totalMining: number;
    totalReward: number;
    totalReferral: number;
    totalWithdrawal: number;
  };
  totalTransactions: number;
  hasData: boolean;
};

type TransactionHistoryResponse = {
  success: boolean;
  data: TransactionItem[];
};

type TransactionHistorySummaryResponse = {
  success: boolean;
  data: TransactionHistorySummary;
};

type GetHistoryFilters = {
  type?: 'all' | TransactionType;
  status?: 'all' | TransactionStatus;
  month?: string;
  limit?: number;
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

    if (filters?.month) {
      params.month = filters.month;
    }

    if (typeof filters?.limit === 'number' && Number.isFinite(filters.limit)) {
      params.limit = String(filters.limit);
    }

    const response = await apiClient.get<TransactionHistoryResponse>(
      '/transactions/history',
      { params }
    );

    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  async getHistorySummary(month: string): Promise<TransactionHistorySummary> {
    const response = await apiClient.get<TransactionHistorySummaryResponse>(
      '/transactions/history/summary',
      {
        params: { month },
      }
    );

    return (
      response.data?.data ?? {
        month,
        points: [],
        availableMonths: [month],
        totals: {
          totalMining: 0,
          totalReward: 0,
          totalReferral: 0,
          totalWithdrawal: 0,
        },
        totalTransactions: 0,
        hasData: false,
      }
    );
  },
};
