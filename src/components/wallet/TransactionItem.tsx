import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import { THEME } from './theme';
import styles from './TransactionItem.style';


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

export default TransactionItem;
