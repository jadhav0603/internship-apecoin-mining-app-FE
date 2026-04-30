import React, { useEffect, useRef } from 'react';
import { Animated, Image, ImageSourcePropType, Pressable, Text, View } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME, getInitial } from './profileTheme';
import styles from './AvatarWithGlow.style';


type AvatarWithGlowProps = {
  username: string;
  source?: ImageSourcePropType;
  onPress?: () => void;
};

const AvatarWithGlow = ({ username, source, onPress }: AvatarWithGlowProps) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const glowPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    );

    glowPulse.start();

    return () => glowPulse.stop();
  }, [glowAnim]);

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const scale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={styles.pressableContainer}
    >
      <Animated.View
        style={[
          styles.avatarOuter,
          {
            shadowOpacity,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.avatarInner}>
          {source ? (
            <Image source={source} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <View style={styles.fallbackAvatar}>
              <Text style={styles.initialText}>{getInitial(username)}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default AvatarWithGlow;
