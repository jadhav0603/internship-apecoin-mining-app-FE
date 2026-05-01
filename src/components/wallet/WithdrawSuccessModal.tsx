import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import { THEME } from './theme';
import styles from './WithdrawSuccessModal.style';


type WithdrawSuccessModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
};

const WithdrawSuccessModal = ({
  visible,
  onClose,
  title = 'Withdraw Request Submitted',
  subtitle = 'Your request is successful but still pending',
}: WithdrawSuccessModalProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onClose}
  >
    <View style={styles.overlay}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
      />

      <View style={styles.modalCard}>
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={10}
        >
          <Ionicons name="close" size={20} color={THEME.textMuted} />
        </Pressable>

        <View style={styles.iconWrap}>
          <View style={styles.iconGlow} />
          <Ionicons name="checkmark" size={30} color={THEME.bg} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  </Modal>
);

export default WithdrawSuccessModal;
