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
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import SafeBlurView from '../constant/SafeBlurView';
import styles from './ClaimPopupModal.style';


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
        <SafeBlurView
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
                style={styles.rotatingGlowGradient}
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
                  source={require('../../assets/animations/success_claim.json')}
                  autoPlay
                  loop
                  style={[StyleSheet.absoluteFill, styles.successBackground]}
                  resizeMode="cover"
                />

                {/* ✅ 2. CLAIM ANIMATION (CENTER FOREGROUND) */}
                <View style={styles.claimAnimWrapper}>
                  <LottieView
                    source={require('../../assets/animations/claim_popup.json')}
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
                <View style={styles.bottomSpacer} />
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ClaimPopupModal;
