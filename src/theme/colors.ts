import { COLORS } from '../constants/COLORS';
export const Colors = {
  // Backgrounds
  bgPrimary: COLORS.neutral950,
  bgCard: COLORS.whiteAlpha08,

  // Accent
  neonGreen: COLORS.brandLimeSoft,
  neonGreenDark: COLORS.brandLimeMuted,

  // Text
  textPrimary: COLORS.white,
  textSecondary: COLORS.whiteAlpha55,
  textMuted: COLORS.whiteAlpha35,

  // Glass / borders
  glassBorder: COLORS.whiteAlpha18,
  glassBg: COLORS.whiteAlpha07,

  // Gradients (used in arrays)
  overlayGradient: [COLORS.blackAlpha15, COLORS.blackAlpha55, COLORS.blackAlpha88] as string[],

  // Misc
  error: COLORS.danger,
  checkboxBorder: COLORS.whiteAlpha40,
};
