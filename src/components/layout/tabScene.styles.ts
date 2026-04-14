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
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.surfaceGlow,
    opacity: 0.28,
  },
  secondaryGlow: {
    position: 'absolute',
    bottom: 90,
    right: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.ringGlowSoft,
    opacity: 0.24,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 18,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 24,
    gap: 10,
  },
  eyebrow: {
    color: COLORS.success,
    fontFamily: FONTS.semibold,
    fontSize: 11,
    letterSpacing: FONTS.letterSpacing.ultraWide,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 32,
    lineHeight: 38,
  },
  description: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 24,
  },
  metricsRow: {
    gap: 12,
  },
  metricCard: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(13, 20, 9, 0.88)',
    gap: 6,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  detailCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 22,
    gap: 10,
  },
  detailTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  detailBody: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 23,
  },
});

export default styles;
