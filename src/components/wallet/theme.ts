export const THEME = {
  bg: '#1a1a1a',
  neonGreen: '#AAFF00',
  neonGreenDim: '#88CC00',
  neonGlow: '#AAFF0066',
  white: '#FFFFFF',
  textMuted: '#aaaaaa',
  cardBg: '#1e1e1e',
  cardBorder: '#AAFF00',
  barMining: '#AAFF00',
  barReward: '#FFFFFF',
  barReferral: '#888888',
  tabActive: '#2a2a2a',
  tabInactive: '#1a1a1a',
  gold: '#FFD700',
  borderMuted: '#2a2a2a',
  overlay: 'rgba(6, 8, 6, 0.56)',
  iconBlue: '#61A8FF',
};

export const formatAmount = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export const formatCompactValue = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);
