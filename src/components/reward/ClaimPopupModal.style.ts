import { Dimensions, StyleSheet } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedWrapper: {
    width: screenWidth * 0.75, // More compact width
    borderRadius: 24,
    shadowColor: '#39FF14',
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
    backgroundColor: '#0a1a0a',
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
    backgroundColor: '#0a1a0a',
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
    backgroundColor: 'transparent',
    marginBottom: 5,
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  dayLabel: {
    fontWeight: '700',
    fontSize: 13,
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 0,
  },
  successTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 0,
  },
  rewardAmount: {
    fontWeight: '900',
    fontSize: 32,
    color: '#39FF14',
    letterSpacing: 1,
    marginTop: 8,
    textShadowColor: '#39FF14',
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
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 12,
    paddingHorizontal: 10,
  },
  claimButton: {
    backgroundColor: '#39FF14',
    borderRadius: 12,
    height: 44, // More compact height
    width: '100%',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#39FF14',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  closeButton: {
    backgroundColor: 'rgba(57,255,20,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(57,255,20,0.4)',
    shadowOpacity: 0,
    elevation: 0,
  },
  claimButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1.5,
  },
  closeButtonText: {
    color: '#39FF14',
  },
  dismissButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  dismissButtonText: {
    color: 'rgba(255, 255, 255, 0.4)',
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
