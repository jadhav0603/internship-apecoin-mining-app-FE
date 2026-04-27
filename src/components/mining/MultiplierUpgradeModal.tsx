import React, { useCallback, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useMining } from '../../context/MiningContext';
import { useRewardedAd } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';
import { useAdLoadingGate } from '../../hooks/useAdLoadingGate';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.85;
const CENTER_SIZE = 80;

interface MultiplierUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
}

// MULTIPLIERS is now driven from MiningContext (backend GlobalSettings)

const MultiplierUpgradeModal: React.FC<MultiplierUpgradeModalProps> = ({
  visible,
  onClose,
}) => {
  const { multiplier, multipliers, setMultiplier } = useMining();
  const currentIndex = multipliers.indexOf(multiplier);
  const [shouldRender, setShouldRender] = React.useState(visible);
  
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const boostScale = useSharedValue(1);
  const [isPendingUpgrade, setIsPendingUpgrade] = React.useState(false);

  const { isLoaded, isClosed, load, show, isEarnedReward } = useRewardedAd(
    AD_UNITS.REWARDED_BOOST,
    { requestNonPersonalizedAdsOnly: true }
  );
  const { startAd, adLoadingModal } = useAdLoadingGate({ isLoaded, load, show });

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(1, { duration: 300 });
      rotation.value = 0; // No rotation on opening
    } else {
      scale.value = withTiming(0.3, { duration: 250, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(0, { duration: 250 });
      rotation.value = withTiming(-90, { duration: 250 });
      
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [opacity, rotation, scale, visible]);

  const handleClose = () => {
    // Trigger the exit animation by letting the parent update the visible prop
    onClose();
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    opacity: opacity.value,
  }));

  const performUpgrade = useCallback(async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < multipliers.length) {
      const nextMultiplier = multipliers[nextIndex];
      await setMultiplier(nextMultiplier);
    }
  }, [currentIndex, multipliers, setMultiplier]);

  useEffect(() => {
    if (isClosed && isPendingUpgrade) {
      setIsPendingUpgrade(false);
      if (isEarnedReward) {
        performUpgrade();
      }
    }
  }, [isClosed, isEarnedReward, isPendingUpgrade, performUpgrade]);

  const handleBoost = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < multipliers.length) {
      // Animation
      boostScale.value = withSpring(0.9, { damping: 10, stiffness: 100 }, () => {
        boostScale.value = withSpring(1);
      });

      startAd({
        onAdShown: () => setIsPendingUpgrade(true),
      });
    }
  };

  const renderMultiplierItem = (m: number, index: number) => {
    const angle = (index * (360 / multipliers.length)) - 90;
    const radius = WHEEL_SIZE / 2 - 40;
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);

    const isActive = multiplier === m;
    const targetIndex = multipliers.indexOf(m);
    // Locked if more than one step ahead of current
    const isLocked = targetIndex > currentIndex + 1;

    return (
      <View
        key={m}
        style={[
          styles.multiplierItem,
          {
            transform: [{ translateX: x }, { translateY: y }],
            backgroundColor: isActive
              ? COLORS.primary
              : isLocked
              ? 'rgba(20, 20, 20, 0.9)'
              : 'rgba(30, 45, 25, 0.9)',
            borderColor: isActive
              ? '#A6FF00'
              : isLocked
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(166, 255, 0, 0.2)',
            opacity: isLocked ? 0.4 : 1,
          },
        ]}
      >
        {isLocked ? (
          <FontAwesome5 name="lock" size={14} color="rgba(255,255,255,0.4)" />
        ) : (
          <Text style={[styles.multiplierText, isActive && styles.activeMultiplierText]}>
            {m}x
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      <Modal visible={shouldRender} transparent animationType="none" onRequestClose={handleClose}>
        <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        
        <Animated.View style={[styles.modalContainer, animatedContainerStyle]}>
          <View style={styles.wheelWrapper}>
            {/* Connecting Lines / Circles */}
            <View style={styles.outerRing} />
            <View style={styles.innerRing} />
            
            {/* Multiplier Items */}
            {multipliers.map((m, i) => renderMultiplierItem(m, i))}

            {/* Center Core */}
            <Pressable 
              onPress={handleBoost}
              disabled={currentIndex >= multipliers.length - 1}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
            >
              <Animated.View style={[
                styles.centerCore,
                useAnimatedStyle(() => ({
                  transform: [{ scale: boostScale.value }]
                }))
              ]}>
                <View style={styles.centerInner}>
                  <FontAwesome5 name="rocket" size={24} color={COLORS.primary} />
                  <Text style={styles.centerLabel}>BOOST</Text>
                </View>
              </Animated.View>
            </Pressable>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title}>Multiplier Wheel</Text>
            <Text style={styles.subtitle}>Select a multiplier to boost your mining earnings instantly.</Text>
          </View>

          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
        </Animated.View>
        </View>
      </Modal>
      {adLoadingModal}
    </>
  );
};

// We need Ionicons
import Ionicons from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    alignItems: 'center',
  },
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: WHEEL_SIZE - 20,
    height: WHEEL_SIZE - 20,
    borderRadius: (WHEEL_SIZE - 20) / 2,
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.1)',
    borderStyle: 'dashed',
  },
  innerRing: {
    position: 'absolute',
    width: CENTER_SIZE + 40,
    height: CENTER_SIZE + 40,
    borderRadius: (CENTER_SIZE + 40) / 2,
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.15)',
  },
  multiplierItem: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#A6FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  multiplierText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  activeMultiplierText: {
    color: '#000',
  },
  centerCore: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  centerInner: {
    alignItems: 'center',
  },
  centerLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: FONTS.bold,
    marginTop: 2,
    letterSpacing: 1,
  },
  infoContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: FONTS.black,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default MultiplierUpgradeModal;
