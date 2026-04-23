import apiClient from '../api/apiClient';

export type TransactionType = 'reward' | 'mining' | 'referral';
export type TransactionStatus = 'claimed' | 'pending';

export type TransactionItem = {
  id: string;
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

export const transactionService = {
  async getHistory(): Promise<TransactionItem[]> {
    const response = await apiClient.get<TransactionHistoryResponse>(
      '/transactions/history'
    );

    return Array.isArray(response.data?.data) ? response.data.data : [];
  },
};
