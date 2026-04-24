import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  showConnector?: boolean;
};

const TransactionItem = ({
  item,
  onPress,
  showConnector = false,
}: TransactionItemProps) => {
  const isPending = item.status === 'pending';

  return (
    <View style={styles.row}>
      <View style={styles.timelineColumn}>
        <View style={[styles.timelineDot, isPending ? styles.pendingDot : styles.paidDot]} />
        {showConnector ? <View style={styles.timelineConnector} /> : null}
      </View>

      <Pressable style={styles.card} onPress={() => onPress?.(item)}>
        <View style={styles.leftColumn}>
          <Text style={styles.amountText}>{item.amount}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        <View style={styles.centerColumn}>
          <View style={isPending ? styles.pendingBadge : styles.paidBadge}>
            <Text style={isPending ? styles.pendingBadgeText : styles.paidBadgeText}>
              {isPending ? 'Pending' : 'Paid'}
            </Text>
          </View>
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.amountText}>{item.amount}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 16,
  },
  timelineColumn: {
    width: 34,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 22,
    borderWidth: 3,
  },
  pendingDot: {
    backgroundColor: '#7DF35F',
    borderColor: 'rgba(125,243,95,0.28)',
  },
  paidDot: {
    backgroundColor: '#82EFCB',
    borderColor: 'rgba(130,239,203,0.28)',
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    marginTop: 8,
    marginBottom: -8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  card: {
    flex: 1,
    minHeight: 108,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'rgba(10, 55, 28, 0.84)',
    borderWidth: 1.2,
    borderColor: 'rgba(173, 242, 106, 0.38)',
    shadowColor: 'rgba(170,255,0,0.18)',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1.2,
  },
  centerColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rightColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountText: {
    color: THEME.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  dateText: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.74)',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  pendingBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(158, 191, 60, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(202,239,103,0.52)',
  },
  pendingBadgeText: {
    color: '#F1FFC8',
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  paidBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(105, 240, 174, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(130,239,203,0.46)',
  },
  paidBadgeText: {
    color: '#D8FFF0',
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});

export default TransactionItem;
