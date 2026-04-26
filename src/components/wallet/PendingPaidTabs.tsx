import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
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
  const [tabWidth, setTabWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;

  const activeItems = useMemo(
    () => (activeTab === 'pending' ? pendingItems : paidItems),
    [activeTab, paidItems, pendingItems],
  );

  useEffect(() => {
    if (!tabWidth) {
      return;
    }

    Animated.spring(indicatorX, {
      toValue: activeTab === 'pending' ? 0 : tabWidth,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.9,
    }).start();
  }, [activeTab, indicatorX, tabWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTabWidth(event.nativeEvent.layout.width / 2);
  };

  const renderLoadingState = () => (
    <View style={styles.stateContainer}>
      <ActivityIndicator size="small" color={THEME.neonGreen} />
      <Text style={styles.stateText}>Loading recent withdrawals...</Text>
      {[0, 1].map(index => (
        <View key={index} style={styles.skeletonRow}>
          <View style={styles.skeletonRail} />
          <View style={styles.skeletonCard}>
            <View style={styles.skeletonLineWide} />
            <View style={styles.skeletonLineShort} />
          </View>
        </View>
      ))}
    </View>
  );

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

      <View style={styles.toggleShell} onLayout={handleLayout}>
        {tabWidth ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.toggleIndicator,
              {
                width: tabWidth,
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />
        ) : null}

        {(['pending', 'paid'] as const).map(tab => {
          const isActive = activeTab === tab;
          const count = tab === 'pending' ? pendingItems.length : paidItems.length;

          return (
            <Pressable
              key={tab}
              style={styles.toggleButton}
              onPress={() => setActiveTab(tab)}
            >
              <View style={styles.toggleContent}>
                <Text style={isActive ? styles.toggleTextActive : styles.toggleTextInactive}>
                  {tab === 'pending' ? 'Pending' : 'Paid'}
                </Text>
                <View
                  style={isActive ? styles.countBadgeActive : styles.countBadgeInactive}
                >
                  <Text style={isActive ? styles.countTextActive : styles.countTextInactive}>
                    {count}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          renderLoadingState()
        ) : error ? (
          <View style={styles.stateContainer}>
            <Ionicons name="alert-circle-outline" size={30} color={THEME.gold} />
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : activeItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={44}
              color="rgba(255,255,255,0.22)"
            />
            <Text style={styles.emptyText}>No {activeTab} withdrawals found.</Text>
          </View>
        ) : (
          activeItems.map((item, index) => (
            <TransactionItem
              key={`${activeTab}-${item.id}`}
              item={item}
              onPress={onRecordPress}
              showConnector={index < activeItems.length - 1}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionEyebrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    marginTop: 6,
    color: THEME.white,
    fontSize: 20,
    fontFamily: FONTS.black,
    fontWeight: '800',
  },
  sectionBadge: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionBadgeText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  toggleShell: {
    position: 'relative',
    flexDirection: 'row',
    borderRadius: 22,
    padding: 6,
    backgroundColor: 'rgba(7, 12, 8, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(157, 231, 95, 0.16)',
    overflow: 'hidden',
  },
  toggleIndicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 6,
    borderRadius: 16,
    backgroundColor: '#6E9918',
    borderWidth: 1,
    borderColor: 'rgba(214,255,120,0.4)',
    shadowColor: 'rgba(170,255,0,0.55)',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  toggleButton: {
    flex: 1,
    zIndex: 1,
    // marginHorizontal: 12,
  },
  toggleContent: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
  },
  toggleTextActive: {
    color: THEME.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    
  },
  toggleTextInactive: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  countBadgeActive: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(8, 13, 7, 0.74)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeInactive: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countTextActive: {
    color: THEME.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  countTextInactive: {
    color: 'rgba(255,255,255,0.54)',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  listContainer: {
    marginTop: 16,
  },
  stateContainer: {
    paddingVertical: 26,
    alignItems: 'center',
  },
  stateText: {
    marginTop: 12,
    color: THEME.textMuted,
    fontSize: 14,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  skeletonRow: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 18,
  },
  skeletonRail: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonCard: {
    flex: 1,
    borderRadius: 22,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  skeletonLineWide: {
    width: '56%',
    height: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonLineShort: {
    width: '34%',
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 12,
  },
  emptyContainer: {
    paddingVertical: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: {
    marginTop: 12,
    color: THEME.textMuted,
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
});

export default PendingPaidTabs;
