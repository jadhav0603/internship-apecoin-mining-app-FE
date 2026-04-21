import React, { PropsWithChildren, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME } from './theme';

type NeonBorderCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

const NeonBorderCard = ({
  children,
  style,
  contentStyle,
}: NeonBorderCardProps) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotatingBorder = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const pulseGlow = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    rotatingBorder.start();
    pulseGlow.start();

    return () => {
      rotatingBorder.stop();
      pulseGlow.stop();
    };
  }, [pulseAnim, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const auraOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0.95],
  });

  const auraScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.02],
  });

  return (
    <View style={[styles.cardShell, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.aura,
          {
            opacity: auraOpacity,
            transform: [{ scale: auraScale }],
          },
        ]}
      />

      <View style={styles.clipMask}>
        <Animated.View
          pointerEvents="none"
          style={[styles.gradientOrbit, { transform: [{ rotate: rotation }] }]}
        >
          <LinearGradient
            colors={[
              THEME.neonGreen,
              '#88FF00',
              '#FFFF00',
              THEME.neonGreen,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientFill}
          />
        </Animated.View>

        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: 22,
    shadowColor: THEME.neonGreen,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  aura: {
    ...StyleSheet.absoluteFill,
    borderRadius: 22,
    backgroundColor: 'rgba(170, 255, 0, 0.08)',
    shadowColor: THEME.neonGreen,
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  clipMask: {
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: 'rgba(170, 255, 0, 0.08)',
  },
  gradientOrbit: {
    position: 'absolute',
    top: -120,
    right: -120,
    bottom: -120,
    left: -120,
  },
  gradientFill: {
    flex: 1,
  },
  content: {
    margin: 2,
    borderRadius: 20,
    backgroundColor: '#181818',
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(170, 255, 0, 0.18)',
  },
});

export default NeonBorderCard;
