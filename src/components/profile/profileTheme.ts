export const PROFILE_THEME = {
  bg: '#0a0f0a',
  cardBg: '#111a11',
  neonGreen: '#AAFF00',
  neonTeal: '#00FFCC',
  neonPurple: '#AA66FF',
  danger: '#FF5C5C',
  dangerBg: '#2b1111',
  dangerBorder: '#5a2323',
  white: '#FFFFFF',
  mutedText: '#666666',
  labelText: '#888888',
  avatarBorder: '#AAFF00',
  menuBg: '#131f13',
  menuBorder: '#1e2e1e',
  settingsIcon: '#ffffff',
  backIcon: '#ffffff',
  buttonBg: '#1a2a1a',
  avatarFallbackBg: '#1a3a1a',
  progressTrack: '#172217',
  skeletonBg: '#1a2a1a',
  chevron: '#444444',
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
