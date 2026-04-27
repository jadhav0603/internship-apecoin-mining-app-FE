import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
  const statusLabel = isPending ? 'Awaiting review' : 'Transfer completed';
  const statusIcon = isPending ? 'time-outline' : 'checkmark-done-outline';

  return (
    <View style={styles.row}>
      <View style={styles.timelineColumn}>
        <View style={[styles.timelineDot, isPending ? styles.pendingDot : styles.paidDot]} />
        {showConnector ? <View style={styles.timelineConnector} /> : null}
      </View>

      <Pressable style={styles.card} onPress={() => onPress?.(item)}>
        <View style={styles.contentColumn}>
          <View style={styles.topRow}>
            <Text style={styles.typeText}>{item.type}</Text>
            <View style={isPending ? styles.pendingBadge : styles.paidBadge}>
              <Text style={isPending ? styles.pendingBadgeText : styles.paidBadgeText}>
                {isPending ? 'Pending' : 'Paid'}
              </Text>
            </View>
          </View>

          <Text style={styles.amountText}>{item.amount}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="rgba(255,255,255,0.62)"
              />
              <Text style={styles.metaText}>{item.date}</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons
                name={statusIcon}
                size={14}
                color={isPending ? '#E7F6A2' : '#B8FFE8'}
              />
              <Text style={styles.metaText}>{statusLabel}</Text>
            </View>
          </View>
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
    minHeight: 110,
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
  },
  contentColumn: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeText: {
    flex: 1,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginRight: 10,
  },
  amountText: {
    marginTop: 10,
    color: THEME.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 6,
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
