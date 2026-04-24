import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONTS } from '../../constants/FONTS';
import { THEME } from './theme';

export type WalletTransaction = {
  id: string;
  type: 'Mining Reward' | 'Referral Bonus' | 'Daily Reward' | 'Withdraw Request';
  amount: string;
  amountValue?: number;
  date: string;
  status: 'pending' | 'paid';
  miningEarnings?: number;
  referralEarnings?: number;
  dailyRewards?: number;
};

type TransactionItemProps = {
  item: WalletTransaction;
  onPress?: (item: WalletTransaction) => void;
};

const TRANSACTION_META: Record<
  WalletTransaction['type'],
  {
    icon: string;
    iconColor: string;
    iconBackground: string;
  }
> = {
  'Mining Reward': {
    icon: 'pickaxe',
    iconColor: THEME.neonGreen,
    iconBackground: 'rgba(170, 255, 0, 0.12)',
  },
  'Referral Bonus': {
    icon: 'account-multiple-outline',
    iconColor: THEME.iconBlue,
    iconBackground: 'rgba(97, 168, 255, 0.14)',
  },
  'Daily Reward': {
    icon: 'gift-outline',
    iconColor: THEME.gold,
    iconBackground: 'rgba(255, 215, 0, 0.14)',
  },
  'Withdraw Request': {
    icon: 'cash-fast',
    iconColor: THEME.neonGreen,
    iconBackground: 'rgba(170, 255, 0, 0.12)',
  },
};

const TransactionItem = ({ item, onPress }: TransactionItemProps) => {
  const meta = TRANSACTION_META[item.type];
  const isPending = item.status === 'pending';

  return (
    <Pressable
      style={styles.transactionCard}
      onPress={() => onPress?.(item)}
    >
      <View style={styles.leftContent}>
        <View style={[styles.txIcon, { backgroundColor: meta.iconBackground }]}>
          <MaterialCommunityIcons
            name={meta.icon}
            size={20}
            color={meta.iconColor}
          />
        </View>

        <View>
          <Text style={styles.txType}>{item.type}</Text>
          <Text style={styles.txDate}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.rightContent}>
        <Text style={styles.txAmount}>{item.amount}</Text>
        <View style={isPending ? styles.pendingBadge : styles.paidBadge}>
          <Text style={isPending ? styles.pendingBadgeText : styles.paidBadgeText}>
            {isPending ? 'PENDING' : 'PAID'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 27, 21, 0.88)',
    borderRadius: 22,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  txIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  txType: {
    color: THEME.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  txDate: {
    color: THEME.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  txAmount: {
    color: THEME.neonGreen,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    textAlign: 'right',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.45)',
    marginTop: 8,
  },
  pendingBadgeText: {
    color: THEME.gold,
    fontSize: 10,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  paidBadge: {
    backgroundColor: 'rgba(170, 255, 0, 0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(170, 255, 0, 0.35)',
    marginTop: 8,
  },
  paidBadgeText: {
    color: THEME.neonGreen,
    fontSize: 10,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});

export default TransactionItem;
