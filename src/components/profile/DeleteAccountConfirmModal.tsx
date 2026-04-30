import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import { COLORS } from '../../constants/COLORS';
import SafeBlurView from '../constant/SafeBlurView';
import styles from './DeleteAccountConfirmModal.style';


type DeleteAccountConfirmModalProps = {
  visible: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

const REQUIRED_PHRASE = 'DELETE';

const DeleteAccountConfirmModal = ({
  visible,
  isSubmitting = false,
  onClose,
  onConfirm,
}: DeleteAccountConfirmModalProps) => {
  const [confirmationText, setConfirmationText] = useState('');
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(26)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (!visible) {
      setConfirmationText('');
      return;
    }

    opacityAnim.setValue(0);
    translateYAnim.setValue(26);
    scaleAnim.setValue(0.96);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        damping: 16,
        stiffness: 180,
        mass: 0.75,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 16,
        stiffness: 180,
        mass: 0.75,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, scaleAnim, translateYAnim, visible]);

  const isConfirmEnabled = useMemo(
    () => confirmationText.trim().toUpperCase() === REQUIRED_PHRASE && !isSubmitting,
    [confirmationText, isSubmitting],
  );

  const handleConfirm = async () => {
    if (!isConfirmEnabled) {
      return;
    }

    await onConfirm();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={isSubmitting ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <SafeBlurView
          style={StyleSheet.absoluteFill as unknown as object}
          blurType="dark"
          blurAmount={16}
          reducedTransparencyFallbackColor="rgba(5, 8, 5, 0.95)"
        />

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={isSubmitting ? undefined : onClose}
        />

        <Animated.View
          style={[
            styles.cardWrap,
            {
              opacity: opacityAnim,
              transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,92,92,0.28)', 'rgba(255,92,92,0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorder}
          >
            <View style={styles.card}>
              <View style={styles.iconBadge}>
                <Ionicons name="trash-outline" size={30} color="#FF8A8A" />
              </View>

              <Text style={styles.title}>Delete Account</Text>
              <Text style={styles.warningText}>
                This action will disable your account and you will not be able to use
                mining, rewards, wallet or withdraw.
              </Text>

              <View style={styles.tipCard}>
                <Text style={styles.tipLabel}>Type to confirm</Text>
                <Text style={styles.tipValue}>{REQUIRED_PHRASE}</Text>
              </View>

              <View style={styles.inputShell}>
                <TextInput
                  value={confirmationText}
                  onChangeText={setConfirmationText}
                  editable={!isSubmitting}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholder="Type DELETE"
                  placeholderTextColor="rgba(255,255,255,0.28)"
                  selectionColor={COLORS.primary}
                  style={styles.input}
                />
              </View>

              <View style={styles.buttonRow}>
                <Pressable
                  onPress={onClose}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && !isSubmitting && styles.buttonPressed,
                    isSubmitting && styles.buttonDisabled,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirm}
                  disabled={!isConfirmEnabled}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && isConfirmEnabled && styles.buttonPressed,
                    !isConfirmEnabled && styles.buttonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={
                      isConfirmEnabled
                        ? ['#FF6F6F', '#D73D3D']
                        : ['rgba(255,92,92,0.18)', 'rgba(255,92,92,0.12)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryButtonGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="warning-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.primaryButtonText}>Delete Account</Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DeleteAccountConfirmModal;
