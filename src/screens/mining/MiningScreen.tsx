import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import SegmentedRing from '../../components/mining/SegmentedRing';
import { COLORS } from '../../constants/COLORS';
import styles from './MiningScreen.style';
import { useMining } from '../../context/MiningContext';
import { useNavigation } from '@react-navigation/native';
import AppBackButton from '../../components/navigation/AppBackButton';
import MiningActionButton from '../../components/mining/MiningActionButton';
import MultiplierUpgradeModal from '../../components/mining/MultiplierUpgradeModal';
import { useTimeModal } from '../../context/TimeModal';

const MiningScreen = () => {
  const TIMER_SEGMENT_COUNT = 72;

  // ============ CONTEXT & HOOKS ============
  const {
    earned,
    claimRewardAmount,
    hasUnclaimedReward,
    secondsLeft,
    isMining,
    hours,
    miningData,
    multiplier,
  } = useMining();

  const navigation = useNavigation();
  const { setShowModal } = useTimeModal();
  const [multiplierModalVisible, setMultiplierModalVisible] = useState(false);

  // ============ COIN CALCULATION STATE ============
  const [displayedEarned, setDisplayedEarned] = useState(earned);
  const previousSecondsLeftRef = useRef(secondsLeft);

  const totalDurationSeconds = Math.max(hours * 3600, 1);

  // Calculate rate per second
  const ratePerSecond = useMemo(() => {
    if (!miningData) return 0;

    const baseDollarValue = miningData.baseDollarValue ?? 0.002;
    const apeDollarValue =
      miningData.apeDollarValue && miningData.apeDollarValue > 0
        ? miningData.apeDollarValue
        : 0.1;

    return ((baseDollarValue / apeDollarValue) * multiplier) / 3600;
  }, [miningData, multiplier]);

  // Live earned calculation
  const liveEarned = useMemo(() => {
    if (!isMining) return earned;
    const syncedValue = earned > displayedEarned ? earned : displayedEarned;
    return syncedValue;
  }, [secondsLeft, isMining, earned, displayedEarned]);

  // Update displayed earned on every tick
  useEffect(() => {
    if (hasUnclaimedReward) {
      setDisplayedEarned(claimRewardAmount || earned);
      previousSecondsLeftRef.current = secondsLeft;
      return;
    }

    if (!isMining) {
      setDisplayedEarned(earned);
      previousSecondsLeftRef.current = secondsLeft;
      return;
    }

    const previousSecondsLeft = previousSecondsLeftRef.current;
    const elapsedTickSeconds = Math.max(previousSecondsLeft - secondsLeft, 0);

    setDisplayedEarned(currentValue => {
      const syncedValue = earned > currentValue ? earned : currentValue;

      if (elapsedTickSeconds <= 0 || ratePerSecond <= 0) {
        return syncedValue;
      }

      return syncedValue + elapsedTickSeconds * ratePerSecond;
    });

    previousSecondsLeftRef.current = secondsLeft;
  }, [
    claimRewardAmount,
    earned,
    hasUnclaimedReward,
    isMining,
    ratePerSecond,
    secondsLeft,
  ]);

  const displayEarned = hasUnclaimedReward
    ? claimRewardAmount || earned
    : liveEarned;

  const minedBalance = (miningData?.totalEarned ?? 0) + displayEarned;

  // ============ RING PROGRESS CALCULATION ============
  const ringProgress = useMemo(() => {
    if (hasUnclaimedReward) {
      return 1;
    }

    if (!isMining) {
      return 0;
    }

    const elapsedSeconds = Math.max(totalDurationSeconds - secondsLeft, 0);
    return Math.min(elapsedSeconds / totalDurationSeconds, 1);
  }, [hasUnclaimedReward, isMining, secondsLeft, totalDurationSeconds]);

  const activeTimerSegments = useMemo(() => {
    if (!isMining && !hasUnclaimedReward) {
      return 0;
    }

    const progressSegments = Math.round(ringProgress * TIMER_SEGMENT_COUNT);
    return Math.max(1, Math.min(TIMER_SEGMENT_COUNT, progressSegments));
  }, [hasUnclaimedReward, isMining, ringProgress]);

  // ============ ANIMATION STATE ============
  const coinFlip = useSharedValue(0);
  const orbitRotation = useSharedValue(0);
  const coinAuraPulse = useSharedValue(0);

  // Animation control
  useEffect(() => {
    if (isMining) {
      coinFlip.value = withRepeat(
        withTiming(360, { duration: 3400, easing: Easing.inOut(Easing.cubic) }),
        -1,
        false,
      );

      orbitRotation.value = withRepeat(
        withTiming(360, { duration: 5200, easing: Easing.linear }),
        -1,
        false,
      );

      coinAuraPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0, { duration: 1900 }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(coinFlip);
      cancelAnimation(orbitRotation);
      cancelAnimation(coinAuraPulse);
      coinFlip.value = 0;
      orbitRotation.value = 0;
      coinAuraPulse.value = 0;
    }
  }, [isMining]);

  // ============ ANIMATED STYLES ============
  const circleFlipAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateY: `${coinFlip.value}deg` },
      { scale: interpolate(coinAuraPulse.value, [0, 1], [1, 1.03]) },
    ],
  }));

  const ellipseRotateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  const coinAuraAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(coinAuraPulse.value, [0, 1], [0.7, 1]),
    transform: [{ scale: interpolate(coinAuraPulse.value, [0, 1], [1, 1.1]) }],
  }));

  // ============ TIME FORMATTER ============
  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');

    return `${h}:${m}:${s}`;
  };

  // ============ RENDER ============
  return (
    <LinearGradient
      colors={[
        COLORS.backgroundGradientStart,
        COLORS.backgroundGradientMid,
        COLORS.backgroundGradientEnd,
      ]}
      start={{ x: 0.12, y: 0 }}
      end={{ x: 0.88, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screenGlowTop} />
        <View style={styles.screenGlowBottom} />

        <View style={styles.topBar}>
          <View style={styles.profileChip}>
            <AppBackButton onPress={() => navigation.goBack()} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.coinCluster}>
            {/* Aura pulse animation */}
            <Animated.View style={[styles.coinAura, coinAuraAnimatedStyle]} />

            {/* Circle flip animation */}
            <Animated.View style={[styles.orbitLayer, circleFlipAnimatedStyle]}>
              <Svg width={240} height={170} style={styles.orbitSvg}>
                <Defs>
                  <RadialGradient id="coinGlow" cx="50%" cy="50%" r="55%">
                    <Stop offset="0%" stopColor="rgba(221, 255, 120, 0.42)" />
                    <Stop offset="70%" stopColor="rgba(160, 214, 60, 0.12)" />
                    <Stop offset="100%" stopColor="rgba(160, 214, 60, 0)" />
                  </RadialGradient>
                </Defs>
                <Circle cx="120" cy="78" r="52" fill="url(#coinGlow)" />
              </Svg>
            </Animated.View>

            {/* Ellipse rotation animation */}
            <Animated.View style={[styles.orbitLayer, ellipseRotateAnimatedStyle]}>
              <Svg width={240} height={170} style={styles.orbitSvg}>
                <Ellipse
                  cx="120"
                  cy="92"
                  rx="76"
                  ry="16"
                  stroke="rgba(255,255,255,0.62)"
                  strokeWidth="2"
                  fill="transparent"
                />
                <Ellipse
                  cx="120"
                  cy="88"
                  rx="88"
                  ry="22"
                  stroke="rgba(255,255,255,0.34)"
                  strokeWidth="2"
                  fill="transparent"
                />
              </Svg>
            </Animated.View>

            {/* Dollar badge */}
            <LinearGradient
              colors={['rgba(229, 255, 141, 0.42)', 'rgba(76, 105, 19, 0.94)']}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={styles.coinBadge}
            >
              <View style={styles.coinBadgeInner}>
                <FontAwesome5 name="dollar-sign" size={32} color="#F4FFC4" />
              </View>
            </LinearGradient>
          </View>

          {/* Live earned amount */}
          <Text style={styles.amountText}>{displayEarned.toFixed(6)} APE</Text>

          {/* Timer ring */}
          <View style={styles.ringSection}>
            <SegmentedRing
              size={320}
              segmentCount={TIMER_SEGMENT_COUNT}
              activeSegments={activeTimerSegments}
              segmentWidth={7}
              segmentHeight={24}
              rotationDuration={18000}
            >
              <LinearGradient
                colors={['rgba(84, 112, 24, 0.96)', 'rgba(22, 32, 12, 0.96)']}
                start={{ x: 0.15, y: 0.05 }}
                end={{ x: 0.85, y: 1 }}
                style={styles.timerCore}
              >
                <View style={styles.timerCoreGlow} />
                <Text style={styles.storageLabel}>Time Storage</Text>
                <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
              </LinearGradient>
            </SegmentedRing>
          </View>
        </View>

        {/* Action buttons and stats */}
        <View style={styles.actionSection}>
          <View style={styles.actionFooter}>
            <View style={styles.actionButtonsRow}>
              <MiningActionButton
                label="Purchase Speed"
                icon="bolt"
                accentColor="#00E5FF"
                onPress={() => setShowModal(true)}
              />
              <MiningActionButton
                label="Upgrade Multiplier"
                icon="rocket"
                accentColor={COLORS.primary}
                onPress={() => setMultiplierModalVisible(true)}
              />
            </View>

            <LinearGradient
              colors={['rgba(39, 57, 15, 0.9)', 'rgba(10, 15, 8, 0.96)']}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.statsCard}
            >
              <View style={styles.statsHeader}>
                <View>
                  <Text style={styles.statsLabel}>MINING STATUS</Text>
                  <Text style={styles.statsTitle}></Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>LIVE</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.metricsRow}>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricValue}>{hours}h</Text>
                  <Text style={styles.metricCaption}>Selected Timer</Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricValue}>
                    {minedBalance.toFixed(6)}
                  </Text>
                  <Text style={styles.metricCaption}>Mined Balance</Text>
                </View>
                <View style={styles.metricBlock}>
                  <Text style={[styles.metricValue, { color: COLORS.primary }]}>
                    {multiplier}x
                  </Text>
                  <Text style={styles.metricCaption}>Multiplier</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </SafeAreaView>

      <MultiplierUpgradeModal
        visible={multiplierModalVisible}
        onClose={() => setMultiplierModalVisible(false)}
      />
    </LinearGradient>
  );
};

export default MiningScreen;
