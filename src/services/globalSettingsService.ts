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

export type OtherAppItem = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  link: string;
  icon: string;
  gradient: [string, string];
  accentColor: string;
  badge?: string;
  comingSoon: boolean;
  isActive: boolean;
};

export type TermsSection = {
  title: string;
  content?: string;
  points?: string[];
};

export type TermsConditionsContent = {
  title: string;
  intro?: {
    heading?: string;
    description?: string;
  };
  sections: TermsSection[];
  buttonText: string;
};

type GlobalSettingsResponse = {
  success: boolean;
  aboutUs: AboutUsContent | null;
};

type FaqSettingsResponse = {
  key: 'FAQ';
  value: FaqItem[];
};

type OtherAppsSettingsResponse = {
  type: 'otherapps';
  apps: OtherAppItem[];
};

type TermsConditionsSettingsResponse = {
  key: 'terms_conditions';
  value: TermsConditionsContent | null;
};

export const globalSettingsService = {
  async getAboutUs(): Promise<AboutUsContent | null> {
    const response = await API.get<GlobalSettingsResponse>('/global-settings', {
      skipAutoSignOut: true,
    } as any);

    return response.data.aboutUs ?? null;
  },

  async getFaq(): Promise<FaqItem[]> {
    const response = await API.get<FaqSettingsResponse>(
      '/global-settings/faq',
      {
        skipAutoSignOut: true,
      } as any,
    );

    return response.data.value ?? [];
  },

  async getOtherApps(): Promise<OtherAppItem[]> {
    const response = await API.get<OtherAppsSettingsResponse>(
      '/global-settings/other-apps',
      {
        skipAutoSignOut: true,
      } as any,
    );

    return response.data.apps ?? [];
  },

  async getTermsConditions(): Promise<TermsConditionsContent | null> {
    const response = await API.get<TermsConditionsSettingsResponse>(
      '/global-settings/terms-conditions',
      {
        skipAutoSignOut: true,
      } as any,
    );

    return response.data.value ?? null;
  },
};
