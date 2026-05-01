import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import {
  PROFILE_THEME,
  formatAmount,
  formatCompactAmount,
} from './profileTheme';

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: PROFILE_THEME.cardBg,
    padding: 20,
    borderWidth: 1,
    borderColor: PROFILE_THEME.menuBorder,
  },
  label: {
    color: PROFILE_THEME.labelText,
    fontSize: 12,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  amount: {
    color: PROFILE_THEME.white,
    fontSize: 34,
    fontFamily: FONTS.black,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  amountUnit: {
    color: PROFILE_THEME.white,
    fontSize: 34,
    fontFamily: FONTS.regular,
    fontWeight: '400',
  },
  loader: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: PROFILE_THEME.progressTrack,
  },
  progressSegment: {
    height: 6,
  },
  segmentLeft: {
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  segmentRight: {
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flex: 1,
  },
  legendLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: PROFILE_THEME.labelText,
    fontSize: 12,
    marginLeft: 6,
  },
  legendValue: {
    color: PROFILE_THEME.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    marginTop: 6,
  },
  legendLoader: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
});

export default styles;
