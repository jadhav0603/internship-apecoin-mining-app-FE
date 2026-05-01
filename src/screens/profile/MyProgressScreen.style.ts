import {
  Animated as RNAnimated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 150;
const CARD_SPACING = 16;
const CARD_FULL_SIZE = CARD_HEIGHT + CARD_SPACING;
const SIDE_PADDING = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
  },
  headerCopy: {
    alignItems: 'center',
  },
  headerEyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: FONTS.letterSpacing.ultraWide,
    marginBottom: 4,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.bold,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  headerSpacer: {
    width: 42,
  },
  fixedGraphContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: 'center',
  },
  bottomFadeMask: {
    position: 'absolute',
    bottom: -60,
    left: 0,
    right: 0,
    height: 60,
  },
  donutCard: {
    width: SCREEN_WIDTH - SIDE_PADDING * 2,
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 22,
    backgroundColor: '#0B1010',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#081019',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  donutSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: 6,
  },
  centerValue: {
    color: COLORS.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: FONTS.black,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  legendList: {
    rowGap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  legendLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  legendPercent: {
    width: 52,
    textAlign: 'right',
    color: COLORS.whiteSoft,
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  legendValue: {
    width: 84,
    textAlign: 'right',
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  cardWrap: {
    height: CARD_FULL_SIZE,
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 28,
    bottom: 28,
    borderRadius: 28,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 24,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(11, 16, 11, 0.96)',
    borderWidth: 1,
    shadowColor: '#A6FF00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  cardBackground: {
    ...StyleSheet.absoluteFill,
  },
  absoluteFill: {
    ...StyleSheet.absoluteFill,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  iconOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
  },
  textColumn: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  cardValue: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontFamily: FONTS.black,
    letterSpacing: FONTS.letterSpacing.tight,
  },
  progressBlock: {
    marginTop: 'auto',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
  },
  progressFillWrap: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default styles;
