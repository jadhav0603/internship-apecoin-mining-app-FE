import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  primaryGlow: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: COLORS.surfaceGlow,
    opacity: 0.5,
  },
  secondaryGlow: {
    position: 'absolute',
    bottom: 80,
    right: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.ringGlowSoft,
    opacity: 0.28,
  },
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
    fontSize: 40,
    lineHeight: 46,
    textAlign: 'center',
    letterSpacing: FONTS.letterSpacing.tight,
    marginBottom: 14,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
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
});

export default styles;
