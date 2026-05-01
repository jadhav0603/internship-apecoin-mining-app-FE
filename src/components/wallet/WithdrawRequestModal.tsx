import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import SafeBlurView from '../constant/SafeBlurView';
import Loading from '../constant/Loading';
import { formatAmount, THEME } from './theme';
import styles from './WithdrawRequestModal.style';

type WithdrawRequestModalProps = {
  visible: boolean;
  amount: number;
  loading?: boolean;
  initialUpiId?: string;
  onClose: () => void;
  onSubmit: (upiId: string) => Promise<void> | void;
};

const UPI_ID_REGEX = /^[a-z0-9._-]{2,256}@[a-z][a-z0-9.-]{1,63}$/i;

const normalizeUpiId = (value: string) => value.trim().toLowerCase();

const isValidUpiId = (value: string) =>
  UPI_ID_REGEX.test(normalizeUpiId(value));

const WithdrawRequestModal = ({
  visible,
  amount,
  loading = false,
  initialUpiId = '',
  onClose,
  onSubmit,
}: WithdrawRequestModalProps) => {
  const [upiId, setUpiId] = useState(initialUpiId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }

    setUpiId(initialUpiId);
    setError('');
  }, [initialUpiId, visible]);

  const formattedAmount = useMemo(() => formatAmount(amount), [amount]);

  const handleClose = () => {
    if (loading) {
      return;
    }

    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    const normalizedUpiId = normalizeUpiId(upiId);

    if (!normalizedUpiId) {
      setError('Please enter your UPI ID.');
      return;
    }

    if (!isValidUpiId(normalizedUpiId)) {
      setError('Enter a valid UPI ID like yourname@bank.');
      return;
    }

    setError('');
    await onSubmit(normalizedUpiId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeBlurView
          style={StyleSheet.absoluteFill as unknown as object}
          blurType="dark"
          blurAmount={14}
          reducedTransparencyFallbackColor="rgba(5, 8, 5, 0.95)"
        />

        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardWrap}
        >
          <View style={styles.card}>
            <Pressable
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={10}
            >
              <Ionicons name="close" size={18} color={THEME.textMuted} />
            </Pressable>

            <View style={styles.iconWrap}>
              <Ionicons
                name="wallet-outline"
                size={28}
                color={THEME.neonGreen}
              />
            </View>

            <Text style={styles.title}>Withdraw to UPI</Text>
            <Text style={styles.subtitle}>
              Enter the UPI ID where you want this withdraw request to be
              processed.
            </Text>

            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Withdraw Amount</Text>
              <Text style={styles.amountValue}>
                {formattedAmount} APE
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>UPI ID</Text>
              <TextInput
                value={upiId}
                onChangeText={value => {
                  setUpiId(value);
                  if (error) {
                    setError('');
                  }
                }}
                placeholder="yourname@bank"
                placeholderTextColor="rgba(255,255,255,0.32)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
                style={[styles.input, error ? styles.inputError : undefined]}
              />
              <Text style={styles.helperText}>
                We will attach this UPI ID to your withdraw request.
              </Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={handleClose}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && !loading ? styles.buttonPressed : undefined,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <View style={styles.buttonSpacer} />

              <View style={styles.submitButtonWrap}>
                <Pressable
                  onPress={() => {
                    handleSubmit().catch(() => undefined);
                  }}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.submitPressable,
                    pressed && !loading ? styles.buttonPressed : undefined,
                    loading ? styles.submitButtonDisabled : undefined,
                  ]}
                >
                  <LinearGradient
                    colors={[THEME.neonGreen, '#A8FF6D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitButton}
                  >
                    {loading ? (
                      <Loading size="small" text={null} />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        Submit Request
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default WithdrawRequestModal;
