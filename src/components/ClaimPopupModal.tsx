import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ClaimPopupModalProps {
  visible: boolean;
  day: number;
  amount: string;
  currency: string;
  balance: number;
  claiming: boolean;
  claimComplete?: boolean;
  onClaim: () => void;
  onClose: () => void;
}

const ClaimPopupModal: React.FC<ClaimPopupModalProps> = ({
  visible,
  day,
  amount,
  currency,
  balance,
  claiming,
  claimComplete = false,
  onClaim,
  onClose,
}) => {
  // Card entrance animation
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Rotating border animation
  const rotationAnim = useRef(new Animated.Value(0)).current;

  // Flip animation
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (visible) {
      // Reset and enter
      scaleAnim.setValue(0.75);
      opacityAnim.setValue(0);
      rotationAnim.setValue(0);
      flipAnim.setValue(0); // Reset flip
      setIsFlipped(false); // Reset flipped state

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Start continuous rotation for the border
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [flipAnim, opacityAnim, rotationAnim, scaleAnim, visible]);

  const rotate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const zIndexFront = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const zIndexBack = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (claimComplete) {
      setIsFlipped(true);
      Animated.spring(flipAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }).start();
    }
  }, [claimComplete, flipAnim]);

  useEffect(() => {
    if (isFlipped && claimComplete) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 300);
    }
  }, [claimComplete, isFlipped]);

  const handleClaimClick = () => {
    onClaim();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Blur backdrop */}
        <BlurView
          style={StyleSheet.absoluteFill as any}
          blurType="dark"
          blurAmount={20}
          reducedTransparencyFallbackColor="rgba(0,0,0,0.85)"
        />

        {/* Tap outside to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill as any}
          onPress={onClose}
          activeOpacity={1}
        />

        {/* Animated card entrance */}
        <Animated.View
          style={[
            styles.animatedWrapper,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Flowing rotating gradient border container */}
          <View style={styles.borderContainer}>
            <Animated.View
              style={[styles.rotatingGlow, { transform: [{ rotate }] }]}
            >
              <LinearGradient
                colors={['#070f06ff', '#0a1a0a', '#14ffe4ff', '#0a1a0a']}
                locations={[0, 0.25, 0.5, 0.75]}
                style={{ flex: 12 }}
                start={{ x: 1, y: 2 }}
                end={{ x: 2, y: 1 }}
              />
            </Animated.View>

            {/* Card Flip Container */}
            <View style={styles.cardContainer}>
              {/* FRONT SIDE */}
              <Animated.View
                style={[
                  styles.card,
                  styles.cardFace,
                  {
                    transform: [
                      { perspective: 1000 },
                      { rotateY: frontRotateY },
                    ],
                    zIndex: zIndexFront,
                  },
                ]}
                pointerEvents={isFlipped ? 'none' : 'auto'}
              >
                {/* Day Label */}
                <Text style={styles.dayLabel}>DAY {day} REWARD</Text>

                {/* Reward Amount */}
                <Text style={styles.rewardAmount}>
                  {amount} {currency}
                </Text>

                {/* Balance */}
                <Text style={styles.balance}>
                  Balance: {balance.toFixed(2)} {currency}
                </Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                  Unbox your reward today and come back tomorrow for more!
                </Text>

                {/* Claim Now Button */}
                <TouchableOpacity
                  style={styles.claimButton}
                  onPress={handleClaimClick}
                  disabled={claiming}
                  activeOpacity={0.85}
                >
                  {claiming ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={styles.claimButtonText}>CLAIM NOW</Text>
                  )}
                </TouchableOpacity>

                {/* Dismiss Button */}
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dismissButtonText}>Close</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* BACK SIDE (Flipped) */}
              {/* BACK SIDE (Flipped) */}
              <Animated.View
                style={[
                  styles.card,
                  styles.cardFace,
                  styles.cardBack,
                  {
                    transform: [
                      { perspective: 1000 },
                      { rotateY: backRotateY },
                    ],
                    zIndex: zIndexBack,
                  },
                ]}
                pointerEvents={isFlipped ? 'auto' : 'none'}
              >
                {/* ✅ 1. SUCCESS BACKGROUND ANIMATION */}
                <LottieView
                  source={require('../assets/animations/success_claim.json')}
                  autoPlay
                  loop
                  style={[StyleSheet.absoluteFill, { borderRadius: 22 }]}
                  resizeMode="cover"
                />

                {/* ✅ 2. CLAIM ANIMATION (CENTER FOREGROUND) */}
                <View style={styles.claimAnimWrapper}>
                  <LottieView
                    source={require('../assets/animations/claim_popup.json')}
                    autoPlay
                    loop={false}
                    style={styles.claimLottie}
                    resizeMode="contain"
                  />
                </View>

                {/* ✅ CONTENT */}
                <Text style={styles.successTitle}>Reward Claimed Successfully</Text>

                <Text style={[styles.rewardAmount, styles.highlightedAmount]}>
                  +{amount} {currency}
                </Text>

                {/* Close Button */}
                <TouchableOpacity
                  style={[styles.claimButton, styles.closeButton]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.claimButtonText, styles.closeButtonText]}>
                    DONE
                  </Text>
                </TouchableOpacity>

                {/* Bottom Spacer */}
                <View style={{ height: 20 }} />
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

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
});

export default ClaimPopupModal;
