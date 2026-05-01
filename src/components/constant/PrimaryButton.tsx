import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import Loading from './Loading';
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
        <Loading size="small" text={null} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
