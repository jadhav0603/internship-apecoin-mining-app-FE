import React, { useRef, useEffect } from 'react';
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
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface ClaimPopupModalProps {
  visible: boolean;
  day: number;
  amount: string;
  currency: string;
  balance: number;
  claiming: boolean;
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
  onClaim,
  onClose,
}) => {
  // Card entrance animation
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Rotating border animation
  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset and enter
      scaleAnim.setValue(0.75);
      opacityAnim.setValue(0);
      rotationAnim.setValue(0);

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
        })
      ).start();
    }
  }, [visible]);

  const rotate = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
            <Animated.View style={[styles.rotatingGlow, { transform: [{ rotate }] }]}>
              <LinearGradient
                colors={['#070f06ff', '#0a1a0a', '#14ffe4ff', '#0a1a0a']}
                locations={[0, 0.25, 0.5, 0.75]}
                style={{ flex: 12 }}
                start={{ x: 1, y: 2}}
                end={{ x: 2, y: 1 }}
              />
            </Animated.View>

            {/* Dark card inner */}
            <View style={styles.card}>
              {/* Lottie animation - Compact */}
              <View style={styles.lottieWrapper}>
                <LottieView
                  source={require('../assets/animations/claim_popup.json')}
                  autoPlay
                  loop
                  style={styles.lottie}
                />
              </View>

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
                You've successfully unboxed your reward! Come back tomorrow for more.
              </Text>

              {/* Claim Now Button */}
              <TouchableOpacity
                style={styles.claimButton}
                onPress={onClaim}
                disabled={claiming}
                activeOpacity={0.85}
              >
                {claiming ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.claimButtonText}>CLAIM NOW</Text>
                )}
              </TouchableOpacity>
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
    width: screenWidth * 0.8, // More compact width
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
  card: {
    backgroundColor: '#0a1a0a',
    borderRadius: 22,
    padding: 16, // More compact padding
    alignItems: 'center',
  },
  lottieWrapper: {
    width: '100%',
    height: 150, // More compact height
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(57,255,20,0.2)',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  dayLabel: {
    fontWeight: '700',
    fontSize: 14, // Smaller font
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  rewardAmount: {
    fontWeight: '900',
    fontSize: 34, // Smaller font
    color: '#39FF14',
    letterSpacing: 1,
    marginTop: 4,
    textShadowColor: '#39FF14',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  balance: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13, // Smaller font
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  claimButton: {
    backgroundColor: '#39FF14',
    borderRadius: 12,
    height: 48, // More compact height
    width: '100%',
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#39FF14',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  claimButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1.5,
  },
});

export default ClaimPopupModal;
