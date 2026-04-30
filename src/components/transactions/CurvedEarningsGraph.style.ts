import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const BADGE_WIDTH = 92;
const BADGE_HEIGHT = 38;
const LABEL_TRACK_HEIGHT = 54;
const Y_AXIS_GUTTER = 28;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
    overflow: 'hidden',
  },
  innerWrap: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  chartViewport: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: Y_AXIS_GUTTER,
  },
  yAxisLabel: {
    position: 'absolute',
    left: 0,
    width: Y_AXIS_GUTTER - 6,
    textAlign: 'right',
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  valueBadge: {
    position: 'absolute',
    width: BADGE_WIDTH,
    height: BADGE_HEIGHT,
    borderRadius: 14,
    backgroundColor: COLORS.backgroundOlive,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  valueBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  monthsRow: {
    height: LABEL_TRACK_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -6,
  },
  monthCell: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  activeMonthBackground: {
    position: 'absolute',
    bottom: 0,
    width: 38,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(166, 255, 0, 0.14)',
  },
  monthLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    marginBottom: 8,
  },
  monthLabelActive: {
    color: COLORS.textPrimary,
  },
});

export default styles;
