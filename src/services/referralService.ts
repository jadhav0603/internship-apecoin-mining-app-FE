import API from './api';

export type ReferralHistoryItem = {
  invitee: string;
  reward: number;
  sourceAmount: number;
  percentage: number;
  trigger: string;
  createdAt: string;
  status: string;
  isActive: boolean;
};

export type ReferralWeekDatum = {
  date: string;
  dayLabel: string;
  totalAmount: number;
};

export type ReferralStats = {
  referredBy: string | null;
  referralEarnings: number;
  referralCount: number;
  referralHistory: ReferralHistoryItem[];
  weekData: ReferralWeekDatum[];
  referralPercentage: number;
  currency?: string;
};

export type ApplyReferralPayload = {
  email: string;
  referralEmail: string;
  source?: 'signup' | 'profile';
};

export type ApplyReferralResponse = {
  success: boolean;
  referredBy: string;
  referralRewardApplied: boolean;
  reward: number;
  totalUserEarnings: number;
  referralPercentage: number;
};

export const referralService = {
  async getStats(email: string): Promise<ReferralStats> {
    const response = await API.get<ReferralStats>(
      `/referral/stats/${encodeURIComponent(email)}`
    );
    return response.data;
  },

  async applyReferral(
    payload: ApplyReferralPayload
  ): Promise<ApplyReferralResponse> {
    const response = await API.post<ApplyReferralResponse>('/referral/apply', payload);
    return response.data;
  },
};
