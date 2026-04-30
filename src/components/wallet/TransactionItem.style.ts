import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { THEME } from './theme';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 16,
  },
  timelineColumn: {
    width: 34,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 22,
    borderWidth: 3,
  },
  pendingDot: {
    backgroundColor: COLORS.green300Tone2,
    borderColor: COLORS.green300Alpha28,
  },
  paidDot: {
    backgroundColor: COLORS.teal300,
    borderColor: COLORS.teal300Alpha28,
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    marginTop: 8,
    marginBottom: -8,
    backgroundColor: COLORS.whiteAlpha12,
  },
  card: {
    flex: 1,
    minHeight: 110,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: COLORS.green900Alpha84,
    borderWidth: 1.2,
    borderColor: COLORS.lime300Alpha38,
    shadowColor: COLORS.lime500Alpha18Tone2,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  contentColumn: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeText: {
    flex: 1,
    color: COLORS.whiteAlpha72,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginRight: 10,
  },
  amountText: {
    marginTop: 10,
    color: THEME.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 6,
    color: COLORS.whiteAlpha74,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  pendingBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: COLORS.yellow500Alpha18,
    borderWidth: 1,
    borderColor: COLORS.yellow300Alpha52,
  },
  pendingBadgeText: {
    color: COLORS.yellow100,
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  paidBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: COLORS.teal300Alpha14,
    borderWidth: 1,
    borderColor: COLORS.teal300Alpha46,
  },
  paidBadgeText: {
    color: COLORS.teal100,
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});

export default styles;
