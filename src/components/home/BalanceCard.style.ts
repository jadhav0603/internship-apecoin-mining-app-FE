import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const SCREEN_WIDTH = Dimensions.get("window").width;


const styles = StyleSheet.create({
  shadowContainer: {
    marginHorizontal: 5,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cardWrapper: {
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2, // border thickness
    backgroundColor: COLORS.green600,
  },
  rotatingGradient: {
    position: 'absolute',
    width: '150%',
    height: '150%',
  },
  container: {
    width: '100%',
    borderRadius: 24, // 26 - 2
    backgroundColor: COLORS.green950Alpha96,
    padding: 8,
    gap: 18,
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
    backgroundColor: COLORS.whiteAlpha05,
  },
  metricIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lime500Alpha08,
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

 })

 export default styles;