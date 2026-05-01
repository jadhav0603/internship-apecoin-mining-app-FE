import { COLORS } from '../../constants/COLORS';
export const THEME = {
  bg: COLORS.neutral900Tone2,
  neonGreen: COLORS.lime500,
  neonGreenDim: COLORS.lime600,
  neonGlow: COLORS.lime500Alpha40Tone2,
  white: COLORS.white,
  textMuted: COLORS.neutral300,
  cardBg: COLORS.neutral900,
  cardBorder: COLORS.lime500,
  barMining: COLORS.lime500,
  barReward: COLORS.white,
  barReferral: COLORS.neutral500Tone2,
  tabActive: COLORS.border,
  tabInactive: COLORS.neutral900Tone2,
  gold: COLORS.gold500Tone2,
  borderMuted: COLORS.border,
  overlay: COLORS.green950Alpha56,
  iconBlue: COLORS.cyan300,
};

export const formatAmount = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  }).format(value);

export const formatCompactValue = (value: number) =>
  new Intl.NumberFormat('en-US').format(value);
