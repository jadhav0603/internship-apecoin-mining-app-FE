import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>Transfer Activity</Text>
          <Text style={styles.sectionTitle}>Recent Withdrawals</Text>
        </View>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{activeItems.length} items</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {(['pending', 'paid'] as const).map(tab => {
          const isActive = activeTab === tab;
          const count = tab === 'pending' ? pendingItems.length : paidItems.length;

          return (
            <Pressable
              key={tab}
              onPress={() => handleTabPress(tab)}
              style={[
                styles.tabButton,
                isActive ? styles.tabButtonActive : styles.tabButtonInactive,
              ]}
            >
              {isActive ? (
                <LinearGradient
                  colors={['#7DA91C', '#6F9818', '#5A7D10']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activePill}
                >
                  <Text style={styles.tabTextActive}>
                    {tab === 'pending' ? 'Pending' : 'Paid'}
                  </Text>
                  <View style={styles.activeCountBadge}>
                    <Text style={styles.activeCountText}>{count}</Text>
                  </View>
                </LinearGradient>
              ) : (
                <View style={styles.inactivePill}>
                  <Text style={styles.tabTextInactive}>
                    {tab === 'pending' ? 'Pending' : 'Paid'}
                  </Text>
                  <Text style={styles.inactiveCountText}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" color={THEME.neonGreen} />
            <Text style={styles.stateText}>Loading transaction activity...</Text>
            {[0, 1, 2].map(index => (
              <View key={index} style={styles.skeletonCard}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonContent}>
                  <View style={styles.skeletonLineWide} />
                  <View style={styles.skeletonLineShort} />
                </View>
                <View style={styles.skeletonMeta}>
                  <View style={styles.skeletonAmount} />
                  <View style={styles.skeletonStatus} />
                </View>
              </View>
            ))}
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
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionEyebrow: {
    color: THEME.textMuted,
    fontSize: 11,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  sectionTitle: {
    marginTop: 4,
    color: THEME.white,
    fontSize: 20,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  sectionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionBadgeText: {
    color: THEME.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 22,
    backgroundColor: 'rgba(8, 12, 8, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(198,255,117,0.12)',
    padding: 6,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
  },
  tabButtonActive: {
    shadowColor: THEME.neonGreen,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  activePill: {
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(214,255,120,0.42)',
    backgroundColor: '#6D9717',
    shadowColor: 'rgba(170,255,0,0.65)',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  inactivePill: {
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  activeCountBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 22, 8, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(214,255,120,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCountText: {
    color: THEME.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  tabTextActive: {
    color: THEME.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  tabTextInactive: {
    color: '#8B9383',
    fontSize: 15,
    fontFamily: FONTS.medium,
    fontWeight: '500',
  },
  inactiveCountText: {
    color: THEME.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  listContainer: {
    marginTop: 12,
  },
  stateContainer: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  stateText: {
    marginTop: 12,
    color: THEME.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: FONTS.medium,
  },
  skeletonCard: {
    width: '100%',
    marginTop: 14,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  skeletonLineWide: {
    height: 14,
    width: '68%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonLineShort: {
    height: 12,
    width: '42%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  skeletonMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  skeletonAmount: {
    width: 74,
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonStatus: {
    width: 56,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: {
    color: THEME.textMuted,
    fontSize: 15,
    fontFamily: FONTS.medium,
    marginTop: 12,
  },
});

export default PendingPaidTabs;
