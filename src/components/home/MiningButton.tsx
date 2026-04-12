import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Path } from "react-native-svg";
import styles from "./style";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

const SIZE = 220;
const STROKE_WIDTH = 18;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MiningButton() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000 }),
      -1,
      false
    );
  }, []);

  const animatedProps = useAnimatedProps(() => {
    return {
      rotation: rotation.value,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.shadowOuter}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#7CFC00" />
              <Stop offset="100%" stopColor="#32CD32" />
            </LinearGradient>
          </Defs>

          {/* Rotating Ring */}
          <AnimatedG
            origin={`${SIZE / 2}, ${SIZE / 2}`}
            animatedProps={animatedProps}
          >
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="url(#grad)"
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${CIRCUMFERENCE * 0.75}, ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              fill="transparent"
            />
          </AnimatedG>
        </Svg>

        {/* Inner Circle */}
        <View style={styles.innerCircle}>
          
            <FontAwesome5 name="hammer" size={24} color="white" solid />

          <Text style={styles.text}>start mining</Text>
        </View>
      </View>
    </View>
  );
}