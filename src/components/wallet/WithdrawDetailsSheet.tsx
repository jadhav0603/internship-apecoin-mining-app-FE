import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import type { WalletTransaction } from './TransactionItem';
import { THEME, formatAmount } from './theme';
import styles from './WithdrawDetailsSheet.style';


type WithdrawDetailsSheetProps = {
  visible: boolean;
  record: WalletTransaction | null;
  onClose: () => void;
};

const WithdrawDetailsSheet = ({
  visible,
  record,
  onClose,
}: WithdrawDetailsSheetProps) => {
  const translateY = useRef(new Animated.Value(340)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          stiffness: 220,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    backdropOpacity.setValue(0);
    translateY.setValue(340);
  }, [backdropOpacity, translateY, visible]);

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 340,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  };

  const breakdown = useMemo(
    () => [
      {
        label: 'Mining earnings',
        value: record?.miningEarnings ?? 0,
        icon: 'construct-outline',
      },
      {
        label: 'Referral earnings',
        value: record?.referralEarnings ?? 0,
        icon: 'people-outline',
      },
      {
        label: 'Daily rewards',
        value: record?.dailyRewards ?? 0,
        icon: 'gift-outline',
      },
    ],
    [record],
  );

  if (!visible || !record) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Withdraw Details</Text>
            <Pressable
              style={styles.closeButton}
              onPress={closeSheet}
              hitSlop={10}
            >
              <Ionicons name="close" size={20} color={THEME.textMuted} />
            </Pressable>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Withdraw</Text>
            <Text style={styles.summaryAmount}>
              {formatAmount(record.amountValue ?? 0)} APE
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillLabel}>Status</Text>
                <Text
                  style={[
                    styles.metaPillValue,
                    record.status === 'paid'
                      ? styles.paidText
                      : styles.pendingText,
                  ]}
                >
                  {record.status.toUpperCase()}
                </Text>
              </View>

              <View style={styles.metaPill}>
                <Text style={styles.metaPillLabel}>Date</Text>
                <Text style={styles.metaPillValue}>{record.date}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.breakdownTitle}>Breakdown</Text>

          <View style={styles.breakdownCard}>
            {breakdown.map(item => (
              <View key={item.label} style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <View style={styles.breakdownIcon}>
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={THEME.neonGreen}
                    />
                  </View>
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                </View>

                <Text style={styles.breakdownValue}>
                  {formatAmount(item.value)} APE
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default WithdrawDetailsSheet;
