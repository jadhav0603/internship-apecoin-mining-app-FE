import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(122, 151, 46, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(202, 231, 125, 0.14)',
  },
  buttonPressed: {
    opacity: 0.82,
  },
});

export default AppBackButton;
