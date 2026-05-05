import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMining } from '../../context/MiningContext';
import {
  FLOATING_TAB_BAR_BASE_HEIGHT,
  FLOATING_TAB_BAR_BOTTOM_OFFSET,
  MINING_LIVE_BAR_GAP,
} from '../../constants/bottomLayout';
import styles, { getContainerStyle } from './MiningLiveBar.style';
import { COLORS } from '../../constants/COLORS';

const SHIMMER_WIDTH = 120;
const PROGRESS_TICK_MS = 250;

const MiningLiveBar = () => {
  const { isMining, secondsLeft, earned, hours, miningData } = useMining();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const previousSessionKeyRef = useRef<string | null>(null);
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const miningStartTime = miningData?.miningStartTime ?? null;
  const selectedHours = miningData?.selectedHour ?? hours ?? 1;
  const sessionDurationMs = Math.max(selectedHours, 1) * 3600 * 1000;
  const sessionKey = miningStartTime
    ? `${miningStartTime}-${selectedHours}`
    : isMining
      ? `fallback-${selectedHours}`
      : 'idle';

  const progress = useMemo(() => {
    if (!isMining) {
      return 0;
    }

    if (miningStartTime) {
      const startTimeMs = new Date(miningStartTime).getTime();

      if (!Number.isNaN(startTimeMs)) {
        const serverNow = nowTick + (Number(miningData?.serverTimeOffsetMs) || 0);
        const elapsedMs = Math.max(0, serverNow - startTimeMs);
        return Math.max(0, Math.min(elapsedMs / sessionDurationMs, 1));
      }
    }

    const totalSeconds = Math.max(selectedHours * 3600, 1);
    return Math.max(0, Math.min((totalSeconds - secondsLeft) / totalSeconds, 1));
  }, [
    isMining,
    miningData?.serverTimeOffsetMs,
    miningStartTime,
    nowTick,
    secondsLeft,
    selectedHours,
    sessionDurationMs,
  ]);

  useEffect(() => {
    if (!isMining) {
      setNowTick(Date.now());
      return;
    }

    setNowTick(Date.now());
    const intervalId = setInterval(() => {
      setNowTick(Date.now());
    }, PROGRESS_TICK_MS);

    return () => clearInterval(intervalId);
  }, [isMining, sessionKey]);

  useEffect(() => {
    if (!isMining) {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
      previousSessionKeyRef.current = null;
      return;
    }

    if (
      previousSessionKeyRef.current &&
      previousSessionKeyRef.current !== sessionKey
    ) {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
    }

    previousSessionKeyRef.current = sessionKey;
    progressAnim.stopAnimation();

    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 220,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [isMining, progress, progressAnim, sessionKey]);

  useEffect(() => {
    if (!isMining) {
      shimmerAnim.stopAnimation();
      shimmerAnim.setValue(0);
      return;
    }

    shimmerAnim.setValue(0);
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    shimmerLoop.start();

    return () => {
      shimmerLoop.stop();
      shimmerAnim.stopAnimation();
    };
  }, [isMining, sessionKey, shimmerAnim]);

  const animatedFillWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, progressTrackWidth],
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHIMMER_WIDTH, Math.max(progressTrackWidth, SHIMMER_WIDTH)],
  });

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setProgressTrackWidth(event.nativeEvent.layout.width);
  };

  const bottomOffset =
    FLOATING_TAB_BAR_BASE_HEIGHT +
    insets.bottom +
    FLOATING_TAB_BAR_BOTTOM_OFFSET +
    MINING_LIVE_BAR_GAP;

  if (route.name === 'Mining') return null;
  if (!isMining) return null;

  return (
    <View style={getContainerStyle(bottomOffset)}>
      <LinearGradient
        colors={['#1d1e1d', '#02040c']}
        style={styles.gradient}
      >
        <View style={styles.progressTrack} onLayout={handleTrackLayout}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.progressFill,
              {
                width: animatedFillWidth,
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(34, 245, 108, 0.38)', 'rgba(131, 255, 88, 0.18)']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.progressGradient}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shimmerWrap,
                { transform: [{ translateX: shimmerTranslateX }] },
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0)',
                  'rgba(232,255,224,0.12)',
                  'rgba(255,255,255,0.45)',
                  'rgba(232,255,224,0.12)',
                  'rgba(255,255,255,0)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmer}
              />
            </Animated.View>
          </Animated.View>
        </View>

        <View style={styles.left}>
          <Text style={styles.label}>MINING LIVE</Text>
          <Text style={styles.value}>
            TIME {formatTime(secondsLeft)}   APE {earned.toFixed(6)}
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Mining')}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <LinearGradient
            colors={[COLORS.primaryDark, COLORS.primaryDark]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>VIEW</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  );
};

export default MiningLiveBar;
