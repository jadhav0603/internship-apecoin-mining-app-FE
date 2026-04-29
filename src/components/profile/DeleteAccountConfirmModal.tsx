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
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import { COLORS } from '../../constants/COLORS';

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
        <BlurView
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 4, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 380,
  },
  cardBorder: {
    borderRadius: 28,
    padding: 1,
  },
  card: {
    borderRadius: 27,
    backgroundColor: 'rgba(10, 15, 10, 0.98)',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconBadge: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,92,92,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,92,92,0.28)',
    marginBottom: 18,
  },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 24,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    marginBottom: 12,
  },
  warningText: {
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 23,
    fontFamily: FONTS.medium,
    marginBottom: 18,
  },
  tipCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  tipLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  tipValue: {
    color: COLORS.primary,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    letterSpacing: 2,
  },
  inputShell: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  input: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.semibold,
    letterSpacing: 1.2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1.2,
    minHeight: 54,
    borderRadius: 18,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flex: 1,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});

export default DeleteAccountConfirmModal;
