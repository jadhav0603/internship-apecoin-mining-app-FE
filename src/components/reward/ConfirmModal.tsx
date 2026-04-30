import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONTS } from '../../constants/FONTS';
import SafeBlurView from '../constant/SafeBlurView';
import { PROFILE_THEME } from '../profile/profileTheme';
import styles from './ConfirmModal.style';


export type ConfirmModalTone = 'danger' | 'primary';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  cancelText?: string;
  confirmText?: string;
  tone?: ConfirmModalTone;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  tone = 'primary',
  onConfirm,
  onCancel,
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (!visible) return;
    opacityAnim.setValue(0);
    scaleAnim.setValue(0.95);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 200,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacityAnim, scaleAnim]);

  if (!visible) return null;

  const isDanger = tone === 'danger';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <SafeBlurView
          style={StyleSheet.absoluteFill as unknown as object}
          blurType="dark"
          blurAmount={12}
          reducedTransparencyFallbackColor="rgba(5, 8, 5, 0.95)"
        />

        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

        <Animated.View
          style={[
            styles.card,
            isDanger && styles.cardDanger,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.title, isDanger && styles.titleDanger]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                isDanger ? styles.confirmButtonDanger : styles.confirmButtonPrimary,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={isDanger ? styles.confirmTextDanger : styles.confirmTextPrimary}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;
