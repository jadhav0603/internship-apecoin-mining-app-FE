import React from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './AppBackButton.style';


type AppBackButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  iconColor?: string;
};

const AppBackButton = ({
  onPress,
  style,
  iconSize = 22,
  iconColor = '#FFFFFF',
}: AppBackButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Go back"
    hitSlop={12}
    onPress={onPress}
    style={({pressed}) => [
      styles.button,
      pressed && styles.buttonPressed,
      style,
    ]}
  >
    <Ionicons name="chevron-back" size={iconSize} color={iconColor} />
  </Pressable>
);

export default AppBackButton;
