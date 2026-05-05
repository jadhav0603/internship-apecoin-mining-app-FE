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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useMining } from '../../context/MiningContext';
import { useAlert } from '../../context/AlertContext';
import { useRewardedAd } from 'react-native-google-mobile-ads';
import { useAds } from '../../context/AdContext';
import { useAdLoadingGate } from '../../hooks/useAdLoadingGate';
import styles from './MultiplierUpgradeModal.style';

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
  const { showError } = useAlert();
  const currentIndex = multipliers.indexOf(multiplier);
  const [shouldRender, setShouldRender] = React.useState(visible);
  
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const boostScale = useSharedValue(1);
  const [isPendingUpgrade, setIsPendingUpgrade] = React.useState(false);
  const { adUnits } = useAds();

  const { isLoaded, isClosed, load, show, isEarnedReward } = useRewardedAd(
    adUnits.REWARDED_BOOST,
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

  const nextIndex = currentIndex + 1;
  const nextMultiplier =
    nextIndex >= 0 && nextIndex < multipliers.length
      ? multipliers[nextIndex]
      : null;

  const performUpgrade = useCallback(async () => {
    if (nextMultiplier !== null) {
      return setMultiplier(nextMultiplier);
    }

    return false;
  }, [nextMultiplier, setMultiplier]);

  useEffect(() => {
    if (isClosed && isPendingUpgrade) {
      setIsPendingUpgrade(false);
      if (isEarnedReward) {
        performUpgrade()
          .then(success => {
            if (success) {
              onClose();
              return;
            }

            showError(
              'Unable to upgrade multiplier right now. Please try again.',
              'Upgrade Failed',
            );
          })
          .catch(() => {
            showError(
              'Unable to upgrade multiplier right now. Please try again.',
              'Upgrade Failed',
            );
          });
      }
    }
  }, [
    isClosed,
    isEarnedReward,
    isPendingUpgrade,
    onClose,
    performUpgrade,
    showError,
  ]);

  const triggerUpgradeFlow = useCallback(() => {
    if (nextMultiplier !== null && !isPendingUpgrade) {
      boostScale.value = withSpring(
        0.9,
        { damping: 10, stiffness: 100 },
        () => {
          boostScale.value = withSpring(1);
        },
      );

      startAd({
        onAdShown: () => setIsPendingUpgrade(true),
      });
    }
  }, [boostScale, isPendingUpgrade, nextMultiplier, startAd]);

  const handleActivateMultiplier = () => {
    triggerUpgradeFlow();
  };

  const renderMultiplierItem = (m: number, index: number) => {
    const angle = (index * (360 / multipliers.length)) - 90;
    const radius = WHEEL_SIZE / 2 - 40;
    const x = radius * Math.cos((angle * Math.PI) / 180);
    const y = radius * Math.sin((angle * Math.PI) / 180);

    const isActive = multiplier === m;
    const targetIndex = multipliers.indexOf(m);
    const isNextMultiplier = targetIndex === currentIndex + 1;
    const isLocked = targetIndex > currentIndex + 1;
    const isClickable = isNextMultiplier && !isPendingUpgrade;

    return (
      <Pressable
        key={m}
        disabled={!isClickable}
        onPress={isClickable ? triggerUpgradeFlow : undefined}
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
              : isNextMultiplier
              ? 'rgba(166, 255, 0, 0.5)'
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
      </Pressable>
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
            <Animated.View
              style={[
                styles.centerCore,
                useAnimatedStyle(() => ({
                  transform: [{ scale: boostScale.value }],
                })),
              ]}
            >
              <View style={styles.centerInner}>
                <FontAwesome5 name="rocket" size={24} color={COLORS.primary} />
                <Text style={styles.centerLabel}>BOOST</Text>
              </View>
            </Animated.View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.title}>Multiplier Wheel</Text>
            <Text style={styles.subtitle}>Select a multiplier to boost your mining earnings instantly.</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.activateButton,
              pressed && styles.activateButtonPressed,
              currentIndex >= multipliers.length - 1 && styles.activateButtonDisabled,
              ]}
            disabled={currentIndex >= multipliers.length - 1 || isPendingUpgrade}
            onPress={handleActivateMultiplier}
          >
            <Text style={styles.activateButtonText}>
              {currentIndex >= multipliers.length - 1
                ? 'Multiplier Maxed'
                : 'Activate Multiplier'}
            </Text>
          </Pressable>

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

export default MultiplierUpgradeModal;
