import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/COLORS';
import SegmentedRing from './SegmentedRing';
import styles from './miningButton.styles';
import { useTimeModal } from '../../context/TimeModal';
import { useMining } from '../../context/MiningContext';
type MiningButtonProps = {
  onPress?: () => void;
};

export default function MiningButton({ onPress }: MiningButtonProps) {
  const navigation = useNavigation<any>();
  const { setShowModal } = useTimeModal();
  const { isMining, hours } = useMining();

  const rotation = useSharedValue(0);
  const borderRotation = useSharedValue(0);
  const iconSwitch = useSharedValue(0); // 0 = start icon, 1 = end icon
  const glow = useSharedValue(1);

  useEffect(() => {
    // Border rotation animation
    borderRotation.value = withRepeat(
      withTiming(360, {
        duration: 6000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [borderRotation]);

  useEffect(() => {
    let isActive = true;

    const startAnimation = () => {
      if (!isActive) return;

      // 1. Rotate 360 degrees
      rotation.value = withTiming(360, {
        duration: 3000,
        easing: Easing.inOut(Easing.quad),
      }, (finished) => {
        if (finished && isActive) {
          // 2. Stop and Switch icon to end
          iconSwitch.value = withSequence(
  withTiming(1, { duration: 400 }),          // show hourglass-end
  withDelay(1200, withTiming(0, { duration: 400 }, (f2) => {
    if (f2 && isActive) {
      rotation.value = 0;
      runOnJS(startAnimation)();
    }
  }))
);
        }
      });
    };

    if (isMining) {
      startAnimation();
      glow.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    } else {
      isActive = false;
      cancelAnimation(rotation);
      cancelAnimation(iconSwitch);
      cancelAnimation(glow);
      rotation.value = 0;
      iconSwitch.value = 0;
      glow.value = 1;
    }

    return () => {
      isActive = false;
    };
  }, [isMining, rotation, iconSwitch, glow]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: 1 + (0.1 * (1 - iconSwitch.value) * (glow.value - 1)) }
      ],
      opacity: 1 - iconSwitch.value,
      position: 'absolute',
    };
  });

  const animatedEndIconStyle = useAnimatedStyle(() => {
    return {
      opacity: iconSwitch.value,
      transform: [
        { scale: 0.8 + 0.2 * iconSwitch.value }
      ],
      position: 'absolute',
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: (glow.value - 1) * 0.5 * (1 - iconSwitch.value),
    transform: [{ scale: glow.value * 1.5 }],
  }));

  const animatedBorderStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${borderRotation.value}deg` }],
  }));

  const handleOpen = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (isMining) {
      navigation.navigate('Mining', { time: hours || 1 });
      return;
    }

    setShowModal(true);
  };

  return (
    <Pressable
      onPress={handleOpen}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressablePressed,
        isMining && { opacity: 0.95 },
      ]}
    >
      <View style={{ borderRadius: 32, overflow: 'hidden', padding: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        {/* Border Beam Animation */}
        <Animated.View style={[{ position: 'absolute', width: '300%', height: '300%', top: '-100%', left: '-100%' }, animatedBorderStyle]}>
          <LinearGradient
            colors={[COLORS.primary, 'transparent', '#10e830ff', 'transparent', COLORS.success, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </Animated.View>

        <LinearGradient
          colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientEnd]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.88, y: 1 }}
          style={styles.card}
        >
        <Text style={styles.footerText}>
          {isMining ? 'MINING IN PROGRESS' : 'TAP TO CONTINUE'}
        </Text>
        <View style={styles.cardGlow} />

        <View style={styles.ringWrapper}>
          <SegmentedRing
            size={182}
            segmentCount={56}
            activeSegments={18}
            segmentWidth={5}
            segmentHeight={18}
            rotationDuration={15000}
          >
            <LinearGradient
              colors={['rgba(129, 164, 39, 0.92)', 'rgba(34, 48, 16, 0.96)']}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.innerCore}
            >
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {isMining && <Animated.View style={[styles.cardGlow, glowStyle, { backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20 }]} />}
                
                <Animated.View style={animatedIconStyle}>
                  <FontAwesome5
                    name="hourglass-start"
                    size={18}
                    color={COLORS.textPrimary}
                  />
                </Animated.View>

                <Animated.View style={animatedEndIconStyle}>
                  <FontAwesome5
                    name="hourglass-end"
                    size={18}
                    color={COLORS.primary}
                  />
                </Animated.View>

                {/* {!isMining && (
                   <FontAwesome5
                    name="play"
                    size={18}
                    color={COLORS.textPrimary}
                    style={styles.playIcon}
                  />
                )} */}
              </View>
            </LinearGradient>
          </SegmentedRing>
        </View>

        {/* <Text style={styles.eyebrow}>MINING ENTRY</Text> */}
        <Text style={styles.title}>
  {isMining ? 'Mining Active' : 'Activate Asset Engine'}
</Text>
       <Text style={styles.subtitle}>
  {isMining
    ? 'Tap to View your active mining session and performance details.'
    : 'Begin mining and track your assets from the dashboard.'}
</Text>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
