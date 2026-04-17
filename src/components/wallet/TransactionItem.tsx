import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONTS } from '../../constants/FONTS';
import { THEME } from './theme';

export type WalletTransaction = {
  id: string;
  type: 'Mining Reward' | 'Referral Bonus' | 'Daily Reward';
  amount: string;
  date: string;
  status: 'pending' | 'paid';
};

type TransactionItemProps = {
  item: WalletTransaction;
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
};

const TransactionItem = ({ item }: TransactionItemProps) => {
  const meta = TRANSACTION_META[item.type];
  const isPending = item.status === 'pending';

  return (
    <View style={styles.transactionCard}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.cardBg,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: THEME.borderMuted,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txType: {
    color: THEME.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  txDate: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  txAmount: {
    color: THEME.neonGreen,
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    textAlign: 'right',
  },
  pendingBadge: {
    backgroundColor: '#3a2a00',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: THEME.gold,
    marginTop: 8,
  },
  pendingBadgeText: {
    color: THEME.gold,
    fontSize: 10,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  paidBadge: {
    backgroundColor: '#0a2a0a',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: THEME.neonGreen,
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
