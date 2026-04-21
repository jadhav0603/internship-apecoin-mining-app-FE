import React from 'react';
import { View } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import styles from './bottomTab.style';

const BottomTab = ({ children, ...props }: BottomTabBarButtonProps) => {
  const isActive = Boolean(props['aria-selected']);

  return (
    <PlatformPressable {...props} pressOpacity={0.98} android_ripple={{ color: 'transparent' }} style={styles.buttonBase}>
      <View style={isActive ? styles.buttonActive : styles.buttonInactive}>
        {children}
      </View>
    </PlatformPressable>
  );
};

export default BottomTab;