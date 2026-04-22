import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { FONTS } from '../constants/FONTS';
import { PROFILE_THEME } from './profile/profileTheme';

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
        <BlurView
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 4, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(170,255,0,0.3)',
    backgroundColor: '#10160e',
    padding: 24,
    shadowColor: PROFILE_THEME.neonGreen,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  cardDanger: {
    borderColor: 'rgba(255,92,92,0.3)',
    shadowColor: PROFILE_THEME.danger,
  },
  title: {
    color: PROFILE_THEME.white,
    fontSize: 22,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleDanger: {
    color: PROFILE_THEME.danger,
  },
  message: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  confirmButtonPrimary: {
    backgroundColor: 'rgba(170,255,0,0.15)',
    borderColor: 'rgba(170,255,0,0.4)',
  },
  confirmButtonDanger: {
    backgroundColor: 'rgba(255,92,92,0.15)',
    borderColor: 'rgba(255,92,92,0.4)',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  cancelText: {
    color: PROFILE_THEME.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  confirmTextPrimary: {
    color: PROFILE_THEME.neonGreen,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  confirmTextDanger: {
    color: PROFILE_THEME.danger,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});

export default ConfirmModal;
