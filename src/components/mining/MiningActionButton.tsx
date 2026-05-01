import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import styles from './MiningActionButton.style';


interface MiningActionButtonProps {
  label: string;
  icon: string;
  onPress: () => void;
  accentColor: string;
  secondaryColor?: string;
}

const MiningActionButton: React.FC<MiningActionButtonProps> = ({
  label,
  icon,
  onPress,
  accentColor,
  secondaryColor = 'transparent',
}) => {
  const borderRotation = useSharedValue(0);
  const pulse = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    borderRotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    pulse.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, []);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${borderRotation.value}deg` }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.03]);
    const opacity = interpolate(pulse.value, [0, 1], [0.8, 1]);
    const shadowOpacity = interpolate(pulse.value, [0, 1], [0.2, 0.6]);
    
    return {
      transform: [{ scale }],
      opacity,
      shadowColor: accentColor,
      shadowOpacity,
    };
  });

  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handlePressIn = () => {
    pressScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withTiming(1, { duration: 100 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressable}
    >
      <Animated.View style={[styles.container, animatedPulseStyle, animatedPressStyle]}>
        {/* Border Beam */}
        <View style={styles.borderWrapper}>
          <Animated.View style={[styles.borderBeam, animatedBorderStyle]}>
            <LinearGradient
              colors={[accentColor, 'transparent', secondaryColor || accentColor, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.full}
            />
          </Animated.View>
        </View>

        {/* Content */}
        <LinearGradient
          colors={['rgba(20, 28, 15, 0.95)', 'rgba(10, 15, 8, 0.98)']}
          style={styles.content}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
            <FontAwesome5 name={icon} size={16} color={accentColor} />
          </View>
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

export default MiningActionButton;
