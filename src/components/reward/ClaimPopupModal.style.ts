import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.blackAlpha80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedWrapper: {
    width: screenWidth * 0.75, // More compact width
    borderRadius: 24,
    shadowColor: COLORS.successNeon,
    shadowOpacity: 0.5,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  borderContainer: {
    borderRadius: 24,
    padding: 2, // Border thickness
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.green950Tone2,
  },
  rotatingGlow: {
    position: 'absolute',
    top: '-100%',
    left: '-100%',
    width: '300%',
    height: '300%',
  },
  rotatingGlowGradient: {
    flex: 12,
  },
  cardContainer: {
    width: '100%',
    height: 310, // Fixed height to prevent layout jumps during flip
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.green950Tone2,
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
  },
  cardFace: {
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    // Hidden initially
  },
  lottieWrapper: {
    width: '100%',
    height: 120, // Compact height for coin animation
    borderRadius: 12,
    backgroundColor: COLORS.transparent,
    marginBottom: 5,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  dayLabel: {
    fontWeight: '700',
    fontSize: 13,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 0,
  },
  successTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 0,
  },
  rewardAmount: {
    fontWeight: '900',
    fontSize: 32,
    color: COLORS.successNeon,
    letterSpacing: 1,
    marginTop: 8,
    textShadowColor: COLORS.successNeon,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  highlightedAmount: {
    fontSize: 36,
    marginTop: 4,
    marginBottom: 10,
  },
  balance: {
    fontSize: 12,
    color: COLORS.whiteAlpha40,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.whiteAlpha60,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 12,
    paddingHorizontal: 10,
  },
  claimButton: {
    backgroundColor: COLORS.successNeon,
    borderRadius: 12,
    height: 44, // More compact height
    width: '100%',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.successNeon,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  closeButton: {
    backgroundColor: COLORS.green500Alpha15,
    borderWidth: 1,
    borderColor: COLORS.green500Alpha40,
    shadowOpacity: 0,
    elevation: 0,
  },
  claimButtonText: {
    color: COLORS.black,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1.5,
  },
  closeButtonText: {
    color: COLORS.successNeon,
  },
  dismissButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  dismissButtonText: {
    color: COLORS.whiteAlpha40,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  claimAnimWrapper: {
    width: '100%',
    height: 160,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  claimLottie: {
    width: '100%',
    height: '100%',
  },
  successBackground: {
    borderRadius: 22,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default styles;
