import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const styles = StyleSheet.create({
  container: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(9, 14, 7, 0.78)',
    padding: 18,
    gap: 18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 12,
    letterSpacing: FONTS.letterSpacing.wide,
    marginBottom: 6,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 30,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(166, 255, 0, 0.08)',
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.medium,
    fontSize: 11,
    marginBottom: 4,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semibold,
    fontSize: 14,
  },
});

export default styles;
