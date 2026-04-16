import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  pressablePressed: {
    opacity: 0.92,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    backgroundColor: COLORS.cardMuted,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.24,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  cardGlow: {
    position: 'absolute',
    top: -24,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.surfaceGlow,
    opacity: 0.42,
  },
  ringWrapper: {
    marginBottom: 18,
  },
  innerCore: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  playIcon: {
    marginLeft: 3,
  },
  eyebrow: {
    color: COLORS.success,
    fontSize: 11,
    letterSpacing: FONTS.letterSpacing.ultraWide,
    fontFamily: FONTS.semibold,
    // marginBottom: 10,
    position: 'relative',
    bottom: 45,
    
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    marginBottom: 8,
    marginTop: -30,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    maxWidth: 260,
  },
    footerText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: FONTS.letterSpacing.wide,
  },
});

export default styles;
