import apiClient from '../api/apiClient';

export type WithdrawRequestPayload = {
  userId: string;
  email: string;
  amount: number;
  upiId: string;
};

export type WithdrawStatus = 'pending' | 'paid';

export type WithdrawRecord = {
  _id?: string;
  id?: string;
  userId: string;
  email: string;
  amount: number;
  upiId?: string;
  isActive: boolean;
  status: WithdrawStatus;
  withdrawalDate: string;
  breakdown?: {
    mining?: number;
    referral?: number;
    rewards?: number;
  };
  miningEarnings?: number;
  referralEarnings?: number;
  dailyRewards?: number;
  _lastDashboardEdit?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type WithdrawRequestResponse = {
  success?: boolean;
  message?: string;
  data?: WithdrawRecord;
};

export const withdrawService = {
  async getWithdrawRecords(): Promise<WithdrawRecord[]> {
    const response = await apiClient.get<{
      success?: boolean;
      data?: WithdrawRecord[];
      records?: WithdrawRecord[];
    }>('/withdraw/list');

    if (Array.isArray(response.data?.data)) {
      return response.data.data.map(item => ({
        ...item,
        miningEarnings: item.miningEarnings ?? item.breakdown?.mining ?? 0,
        referralEarnings: item.referralEarnings ?? item.breakdown?.referral ?? 0,
        dailyRewards: item.dailyRewards ?? item.breakdown?.rewards ?? 0,
      }));
    }

    if (Array.isArray(response.data?.records)) {
      return response.data.records.map(item => ({
        ...item,
        miningEarnings: item.miningEarnings ?? item.breakdown?.mining ?? 0,
        referralEarnings: item.referralEarnings ?? item.breakdown?.referral ?? 0,
        dailyRewards: item.dailyRewards ?? item.breakdown?.rewards ?? 0,
      }));
    }

    return [];
  },

  async requestWithdraw(
    payload: WithdrawRequestPayload
  ): Promise<WithdrawRequestResponse> {
    const response = await apiClient.post<WithdrawRequestResponse>(
      '/withdraw/request',
      payload
    );

    return response.data;
  },
};
