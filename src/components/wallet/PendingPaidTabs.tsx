import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONTS } from '../../constants/FONTS';
import TransactionItem, { WalletTransaction } from './TransactionItem';
import { THEME } from './theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

type WalletTab = 'pending' | 'paid';

type PendingPaidTabsProps = {
  pendingItems: WalletTransaction[];
  paidItems: WalletTransaction[];
  loading?: boolean;
  error?: string | null;
  onRecordPress?: (item: WalletTransaction) => void;
};

const PendingPaidTabs = ({
  pendingItems,
  paidItems,
  loading = false,
  error = null,
  onRecordPress,
}: PendingPaidTabsProps) => {
  const [activeTab, setActiveTab] = useState<WalletTab>('pending');

  const activeItems = useMemo(
    () => (activeTab === 'pending' ? pendingItems : paidItems),
    [activeTab, paidItems, pendingItems],
  );

  const handleTabPress = (nextTab: WalletTab) => {
    if (nextTab === activeTab) {
      return;
    }

    setActiveTab(nextTab);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabContainer}>
        <Pressable
          onPress={() => handleTabPress('pending')}
          style={[
            styles.tabButton,
            activeTab === 'pending' ? styles.tabButtonActive : styles.tabButtonInactive,
          ]}
        >
          <Text
            style={[
              activeTab === 'pending'
                ? styles.tabTextActive
                : styles.tabTextInactive,
            ]}
          >
            Pending
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleTabPress('paid')}
          style={[
            styles.tabButton,
            activeTab === 'paid' ? styles.tabButtonActive : styles.tabButtonInactive,
          ]}
        >
          <Text
            style={[
              activeTab === 'paid' ? styles.tabTextActive : styles.tabTextInactive,
            ]}
          >
            Paid
          </Text>
        </Pressable>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color={THEME.neonGreen} />
            <Text style={styles.stateText}>Loading transactions...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <Ionicons name="alert-circle-outline" size={32} color={THEME.gold} />
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : activeItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={THEME.borderMuted} />
            <Text style={styles.emptyText}>No {activeTab} transactions found.</Text>
          </View>
        ) : (
          activeItems.map(item => (
            <View key={`${activeTab}-${item.id}`}>
              <TransactionItem item={item} onPress={onRecordPress} />
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 14,
    backgroundColor: THEME.tabInactive,
    borderWidth: 1,
    borderColor: THEME.borderMuted,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: THEME.tabActive,
    shadowColor: THEME.neonGreen,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabTextActive: {
    color: THEME.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  tabTextInactive: {
    color: '#666666',
    fontSize: 16,
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
  listContainer: {
    marginTop: 6,
  },
  stateContainer: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    marginTop: 12,
    color: THEME.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: FONTS.medium,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: THEME.textMuted,
    fontSize: 15,
    fontFamily: FONTS.medium,
    marginTop: 12,
  },
});

export default PendingPaidTabs;
