import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    marginTop:-10,
  },
  primaryGlow: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.surfaceGlow,
    opacity: 0.34,
  },
  secondaryGlow: {
    position: 'absolute',
    right: -50,
    bottom: 80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.ringGlowSoft,
    opacity: 0.3,
  },
  headerWrap: {
    // paddingHorizontal: 20,
    // paddingTop: 8,
    // paddingBottom: 14,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
  },

  //OLD SECTION
  // heroCard: {
  //   borderRadius: 30,
  //   borderWidth: 1,
  //   borderColor: COLORS.glassBorder,
  //   padding: 24,
  //   overflow: 'hidden',
  //   shadowColor: COLORS.primary,
  //   shadowOpacity: 0.16,
  //   shadowRadius: 24,
  //   shadowOffset: { width: 0, height: 16 },
  //   elevation: 12,
  // },
  // badge: {
  //   alignSelf: 'flex-start',
  //   color: COLORS.success,
  //   fontFamily: FONTS.semibold,
  //   fontSize: 11,
  //   letterSpacing: FONTS.letterSpacing.ultraWide,
  //   marginBottom: 14,
  // },
  // title: {
  //   color: COLORS.textPrimary,
  //   fontFamily: FONTS.black,
  //   fontSize: 34,
  //   lineHeight: 40,
  //   letterSpacing: FONTS.letterSpacing.tight,
  //   marginBottom: 12,
  // },
  // subtitle: {
  //   color: COLORS.textSecondary,
  //   fontFamily: FONTS.regular,
  //   fontSize: 15,
  //   lineHeight: 24,
  //   marginBottom: 22,
  // },
  // signalRow: {
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   gap: 12,
  // },
  // signalCard: {
  //   flexGrow: 1,
  //   minWidth: 95,
  //   borderRadius: 20,
  //   backgroundColor: 'rgba(255, 255, 255, 0.05)',
  //   paddingHorizontal: 14,
  //   paddingVertical: 16,
  //   gap: 8,
  // },
  // signalLabel: {
  //   color: COLORS.textMuted,
  //   fontFamily: FONTS.medium,
  //   fontSize: 12,
  // },
  // signalValue: {
  //   color: COLORS.textPrimary,
  //   fontFamily: FONTS.bold,
  //   fontSize: 18,
  // },
  // section: {
  //   gap: 6,
  // },
  // sectionEyebrow: {
  //   color: COLORS.success,
  //   fontFamily: FONTS.semibold,
  //   fontSize: 11,
  //   letterSpacing: FONTS.letterSpacing.ultraWide,
  // },
  // sectionTitle: {
  //   color: COLORS.textPrimary,
  //   fontFamily: FONTS.bold,
  //   fontSize: 24,
  //   lineHeight: 30,
  // },
  // sectionSubtitle: {
  //   color: COLORS.textSecondary,
  //   fontFamily: FONTS.regular,
  //   fontSize: 14,
  //   lineHeight: 22,
  // },
  analyticsGrid: {
    gap: 14,
  },
  analyticsCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 20,
    gap: 10,
  },
  analyticsLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 12,
    letterSpacing: FONTS.letterSpacing.wide,
  },
  analyticsValue: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  analyticsBody: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
  },

  //NEW SECTION
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  badge: {
    alignSelf: 'center',
    color: COLORS.success,
    fontFamily: FONTS.semibold,
    fontSize: 12,
    letterSpacing: FONTS.letterSpacing.ultraWide,
    marginBottom: 18,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.black,
    fontSize: 26,
    lineHeight: 46,
    // textAlign: 'center',
    letterSpacing: FONTS.letterSpacing.tight,
    marginBottom: 14,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 24,
    // textAlign: 'center',
    marginBottom: 34,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: '100%',
  },
  footerText: {
    marginTop: 18,
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: FONTS.letterSpacing.wide,
  },
  adContainer: {
    alignItems: 'center',
    marginTop:10,
    marginBottom: 2,
    width: '100%',
  },
});

export default styles;
