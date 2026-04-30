import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/COLORS';
import styles from './SegmentedRing.style';

const AnimatedView = Animated.createAnimatedComponent(View);

type SegmentedRingProps = {
  size: number;
  segmentCount?: number;
  activeSegments?: number;
  segmentWidth?: number;
  segmentHeight?: number;
  rotationDuration?: number;
  showPulse?: boolean;
  showRotation?: boolean;
  children?: React.ReactNode;
};

export default function SegmentedRing({
  size,
  segmentCount = 72,
  activeSegments = 24,
  segmentWidth = 6,
  segmentHeight = 22,
  rotationDuration = 18000,
  showPulse = true,
  showRotation = true,
  children,
}: SegmentedRingProps) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (showRotation) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: rotationDuration,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    }

    if (showPulse) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.02, {
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.985, {
            duration: 1700,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      );
    }
  }, [pulse, rotation, rotationDuration, showPulse, showRotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: pulse.value }],
    };
  });

  const center = size / 2;
  const ringRadius = size * 0.39;
  const trackRadius = ringRadius + segmentHeight * 0.1;
  const innerSize = size * 0.62;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <AnimatedView style={[styles.absoluteFill, animatedStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="ringAmbientGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={COLORS.ringGlowSoft} stopOpacity="0.65" />
              <Stop offset="72%" stopColor={COLORS.ringGlowSoft} stopOpacity="0.14" />
              <Stop offset="100%" stopColor={COLORS.ringGlowSoft} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          <Circle
            cx={center}
            cy={center}
            r={trackRadius + segmentHeight}
            fill="url(#ringAmbientGlow)"
          />
          <Circle
            cx={center}
            cy={center}
            r={ringRadius}
            stroke={COLORS.ringTrack}
            strokeWidth={1.4}
            fill="transparent"
          />

          {Array.from({ length: segmentCount }).map((_, index) => {
            const angle = index * (360 / segmentCount);
            const isActive = index < activeSegments;
            const activeProgress = activeSegments > 1 ? index / (activeSegments - 1) : 0;
            const glowOpacity = isActive ? 0.28 - activeProgress * 0.16 : 0;
            const segmentOpacity = isActive ? 1 - activeProgress * 0.52 : 0.24;
            const glowWidth = segmentWidth + 3;
            const glowHeight = segmentHeight + 6;

            return (
              <React.Fragment key={`segment-${index}`}>
                {glowOpacity > 0 ? (
                  <Rect
                    x={center - glowWidth / 2}
                    y={center - ringRadius - glowHeight / 2}
                    width={glowWidth}
                    height={glowHeight}
                    rx={glowWidth / 2}
                    fill={COLORS.ringGlow}
                    opacity={glowOpacity}
                    transform={`rotate(${angle} ${center} ${center})`}
                  />
                ) : null}
                <Rect
                  x={center - segmentWidth / 2}
                  y={center - ringRadius - segmentHeight / 2}
                  width={segmentWidth}
                  height={segmentHeight}
                  rx={segmentWidth / 2}
                  fill={isActive ? COLORS.primary : COLORS.ringInactive}
                  opacity={segmentOpacity}
                  transform={`rotate(${angle} ${center} ${center})`}
                />
              </React.Fragment>
            );
          })}
        </Svg>
      </AnimatedView>

      <View
        style={[
          styles.centerOverlay,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}>
        {children}
      </View>
    </View>
  );
}
