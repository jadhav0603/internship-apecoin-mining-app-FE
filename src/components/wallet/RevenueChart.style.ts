import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { THEME, formatCompactValue } from './theme';
import { COLORS } from '../../constants/COLORS';

const CHART_HEIGHT = 160;
const BAR_WIDTH = 8;

const styles = StyleSheet.create({
  chartCard: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: THEME.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  badge: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.neonGreen,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.yellow900,
  },
  badgeText: {
    color: THEME.neonGreen,
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  chartWrap: {
    marginTop: 22,
    height: CHART_HEIGHT + 30,
    justifyContent: 'flex-end',
  },
  dashLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: COLORS.neutral800Tone2,
  },
  chartScrollContent: {
    minWidth: '100%',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barTrack: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  todayBarGlow: {
    shadowOpacity: 0.92,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  dayLabel: {
    marginTop: 12,
    color: COLORS.neutral500Tone4,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  dayLabelToday: {
    color: THEME.neonGreen,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.borderMuted,
  },
  legendItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  legendLabel: {
    color: THEME.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  legendValue: {
    color: THEME.white,
    fontSize: 18,
    fontFamily: FONTS.black,
    fontWeight: '800',
    marginTop: 4,
  },
  legendDivider: {
    width: 1,
    backgroundColor: THEME.borderMuted,
    marginHorizontal: 4,
  },
  legendLoader: {
    marginTop: 4,
  },
});

export default styles;
