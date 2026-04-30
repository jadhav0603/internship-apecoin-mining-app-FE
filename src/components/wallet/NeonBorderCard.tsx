import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { THEME } from './theme';
import styles from './NeonBorderCard.style';


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

export default NeonBorderCard;
