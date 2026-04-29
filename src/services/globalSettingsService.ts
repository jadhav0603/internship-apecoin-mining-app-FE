import API from './api';

export type AboutTextSection = {
  title?: string;
  description?: string;
};

export type AboutMiningSection = AboutTextSection & {
  apeDollarValue?: number;
  apeCoinPerUsd?: number;
  displayValue?: string;
};

export type AboutDailyRewardsSection = AboutTextSection & {
  rewardDays?: number;
  rewardValues?: number[];
};

export type AboutReferralSection = AboutTextSection & {
  percentage?: number;
  displayValue?: string;
};

export type AboutSocialLink = {
  label: string;
  icon: string;
  url: string;
};

export type AboutUsContent = {
  pageTitle?: string;
  headerImageUrl?: string;
  aboutCard?: AboutTextSection;
  mining?: AboutMiningSection;
  dailyRewards?: AboutDailyRewardsSection;
  referral?: AboutReferralSection;
  appWorking?: AboutTextSection;
  social?: {
    title?: string;
    links?: AboutSocialLink[];
  };
};

export type FaqItem = {
  question: string;
  answer: string;
  icon?: string;
};

type GlobalSettingsResponse = {
  success: boolean;
  aboutUs: AboutUsContent | null;
};

type FaqSettingsResponse = {
  key: 'FAQ';
  value: FaqItem[];
};

export const globalSettingsService = {
  async getAboutUs(): Promise<AboutUsContent | null> {
    const response = await API.get<GlobalSettingsResponse>('/global-settings', {
      skipAutoSignOut: true,
    } as any);

    return response.data.aboutUs ?? null;
  },

  async getFaq(): Promise<FaqItem[]> {
    const response = await API.get<FaqSettingsResponse>('/global-settings/faq', {
      skipAutoSignOut: true,
    } as any);

    return response.data.value ?? [];
  },
};
