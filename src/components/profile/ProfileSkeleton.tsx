import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PROFILE_THEME } from './profileTheme';

const ProfileSkeleton = () => {
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <View style={styles.avatarPlaceholder} />
      <View style={styles.namePlaceholder} />
      <View style={styles.handlePlaceholder} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 16,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PROFILE_THEME.skeletonBg,
  },
  namePlaceholder: {
    width: 140,
    height: 20,
    borderRadius: 6,
    backgroundColor: PROFILE_THEME.skeletonBg,
    marginTop: 18,
  },
  handlePlaceholder: {
    width: 100,
    height: 14,
    borderRadius: 6,
    backgroundColor: PROFILE_THEME.skeletonBg,
    marginTop: 10,
  },
});

export default ProfileSkeleton;
