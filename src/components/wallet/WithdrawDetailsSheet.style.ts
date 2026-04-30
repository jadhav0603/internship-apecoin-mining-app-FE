import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { THEME, formatAmount } from './theme';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.blackAlpha50,
  },
  sheet: {
    backgroundColor: COLORS.green900Tone12,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.lime500Alpha12,
    shadowColor: COLORS.black,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 20,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.whiteAlpha18,
    alignSelf: 'center',
  },
  headerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: THEME.white,
    fontSize: 22,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.whiteAlpha06,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha08,
  },
  summaryCard: {
    marginTop: 18,
    borderRadius: 22,
    padding: 18,
    backgroundColor: COLORS.lime900Alpha96,
    borderWidth: 1,
    borderColor: THEME.borderMuted,
  },
  summaryLabel: {
    color: THEME.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  summaryAmount: {
    marginTop: 6,
    color: THEME.white,
    fontSize: 32,
    fontFamily: FONTS.black,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  metaPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.whiteAlpha03,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha06,
  },
  metaPillLabel: {
    color: THEME.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  metaPillValue: {
    marginTop: 4,
    color: THEME.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  paidText: {
    color: THEME.neonGreen,
  },
  pendingText: {
    color: THEME.gold,
  },
  breakdownTitle: {
    marginTop: 20,
    color: THEME.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  breakdownCard: {
    marginTop: 12,
    borderRadius: 22,
    padding: 16,
    backgroundColor: COLORS.lime900Alpha96,
    borderWidth: 1,
    borderColor: THEME.borderMuted,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lime500Alpha08Tone2,
    marginRight: 12,
  },
  breakdownLabel: {
    color: THEME.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  breakdownValue: {
    color: THEME.neonGreen,
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});

export default styles;
