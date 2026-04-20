import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME, getInitial } from './profileTheme';

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

const styles = StyleSheet.create({
  pressableContainer: {
    alignSelf: 'center',
  },
  avatarOuter: {
    marginTop: 16,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: PROFILE_THEME.avatarBorder,
    shadowColor: PROFILE_THEME.neonGreen,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: PROFILE_THEME.avatarFallbackBg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  fallbackAvatar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PROFILE_THEME.avatarFallbackBg,
  },
  initialText: {
    color: PROFILE_THEME.neonGreen,
    fontSize: 36,
    fontFamily: FONTS.black,
    fontWeight: '800',
  },
});

export default AvatarWithGlow;
