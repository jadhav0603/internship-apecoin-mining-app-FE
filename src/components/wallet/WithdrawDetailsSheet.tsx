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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#171b16',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(170, 255, 0, 0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 20,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
  },
  headerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: THEME.white,
    fontSize: 22,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  summaryCard: {
    marginTop: 18,
    borderRadius: 22,
    padding: 18,
    backgroundColor: 'rgba(28, 32, 24, 0.96)',
    borderWidth: 1,
    borderColor: THEME.borderMuted,
  },
  summaryLabel: {
    color: THEME.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  summaryAmount: {
    marginTop: 6,
    color: THEME.white,
    fontSize: 32,
    fontFamily: FONTS.black,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  metaPill: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  metaPillLabel: {
    color: THEME.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  metaPillValue: {
    marginTop: 4,
    color: THEME.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  paidText: {
    color: THEME.neonGreen,
  },
  pendingText: {
    color: THEME.gold,
  },
  breakdownTitle: {
    marginTop: 20,
    color: THEME.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  breakdownCard: {
    marginTop: 12,
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(28, 32, 24, 0.96)',
    borderWidth: 1,
    borderColor: THEME.borderMuted,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(170, 255, 0, 0.08)',
    marginRight: 12,
  },
  breakdownLabel: {
    color: THEME.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  breakdownValue: {
    color: THEME.neonGreen,
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});

export default WithdrawDetailsSheet;
