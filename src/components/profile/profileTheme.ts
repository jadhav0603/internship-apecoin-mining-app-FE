import { COLORS } from '../../constants/COLORS';
export const PROFILE_THEME = {
  bg: COLORS.background,
  cardBg: COLORS.green900Tone7,
  neonGreen: COLORS.lime500,
  neonTeal: COLORS.teal500,
  neonPurple: COLORS.indigo300,
  danger: COLORS.danger,
  dangerBg: COLORS.red900,
  dangerBorder: COLORS.red800,
  white: COLORS.white,
  mutedText: COLORS.neutral600,
  labelText: COLORS.neutral500Tone2,
  avatarBorder: COLORS.lime500,
  menuBg: COLORS.green900Tone8,
  menuBorder: COLORS.green850,
  settingsIcon: COLORS.white,
  backIcon: COLORS.white,
  buttonBg: COLORS.green900Tone9,
  avatarFallbackBg: COLORS.green850Tone2,
  progressTrack: COLORS.green900Tone10,
  skeletonBg: COLORS.green900Tone9,
  chevron: COLORS.neutral800,
};

export const COIN_BREAKDOWN = [
  {
    key: 'mining',
    label: 'Mining',
    value: 10500,
    ratio: 0.6,
    color: PROFILE_THEME.neonGreen,
  },
  {
    key: 'rewards',
    label: 'Rewards',
    value: 4375,
    ratio: 0.25,
    color: PROFILE_THEME.neonTeal,
  },
  {
    key: 'referral',
    label: 'Referral',
    value: 2625,
    ratio: 0.15,
    color: PROFILE_THEME.neonPurple,
  },
] as const;

export const TOTAL_COINS = COIN_BREAKDOWN.reduce(
  (total, item) => total + item.value,
  0,
);

export const formatAmount = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const formatCompactAmount = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);

const titleCase = (value: string) =>
  value.replace(/\b\w/g, match => match.toUpperCase());

const buildNameFromEmail = (email?: string) => {
  if (!email) {
    return '';
  }

  const localPart = email.split('@')[0]?.trim();
  if (!localPart) {
    return '';
  }

  return titleCase(
    localPart
      .replace(/[._-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
};

export const resolveProfileName = (username?: string, email?: string) => {
  const sanitizedName = username?.trim();
  if (sanitizedName) {
    return sanitizedName;
  }

  const emailName = buildNameFromEmail(email);
  if (emailName) {
    return emailName;
  }

  return 'User';
};

export const buildHandle = (username?: string) => {
  const safeName = username?.trim() || 'User';
  const normalized = safeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `@${normalized || 'user'}`;
};

export const getInitial = (username?: string) =>
  username?.trim()?.charAt(0)?.toUpperCase() || 'U';
