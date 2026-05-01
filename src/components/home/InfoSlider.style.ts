import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // Exactly matches MiningButton width (width - 2*20 padding)
const GAP = 12;

const styles = StyleSheet.create({
  outerContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  container: {
    position: 'relative',
    height: 125,
  },
  listContent: {
    paddingBottom: 10,
  },
  cardContainer: {
    marginRight: GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: 110,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
    // Professional Shadow
    shadowColor: COLORS.black,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.lime500Alpha10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lime500Alpha20,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: 18,
    letterSpacing: 0.4,
  },
  description: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.lime500Alpha20,
  },
  activeDot: {
    width: 22,
    backgroundColor: COLORS.primary,
  },
  leftFade: {
    position: 'absolute',
    left: -20, // Negative to account for ScrollView padding if needed, but let's keep it clean
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 1,
  },
  rightFade: {
    position: 'absolute',
    right: -20,
    top: 0,
    bottom: 0,
    width: 20,
    zIndex: 1,
  },
});

export default styles;
