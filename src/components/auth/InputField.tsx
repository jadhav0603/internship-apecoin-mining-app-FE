import React, {useState} from 'react';
import { View, TextInput, Text, TouchableOpacity, ViewStyle } from 'react-native';
import {Colors} from '../../theme/colors';
import styles from './InputField.style';


interface InputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  icon?: string; // optional — not shown in current design
  error?: string;
  containerStyle?: ViewStyle;
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  keyboardType = 'default',
  icon,
  error,
  containerStyle,
}) => {
  const [secureText, setSecureText] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          !!error && styles.containerError,
        ]}>

        {/* Left Icon — only if provided */}
        {!!icon && <Text style={styles.icon}>{icon}</Text>}

        {/* Text Input */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={'rgba(255,255,255,0.35)'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {/* Password Eye Toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setSecureText(prev => !prev)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{secureText ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default InputField;
