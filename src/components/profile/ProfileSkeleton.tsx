import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { PROFILE_THEME } from './profileTheme';
import styles from './ProfileSkeleton.style';


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

export default ProfileSkeleton;
