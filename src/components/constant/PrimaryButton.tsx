import React from 'react';
import { TouchableOpacity, Text, ViewStyle, ActivityIndicator, View } from 'react-native';
import {Colors} from '../../theme/colors';
import styles from './PrimaryButton.style';


interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  loading = false,
  style,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      activeOpacity={0.82}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={Colors.bgPrimary} size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
