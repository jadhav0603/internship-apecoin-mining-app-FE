import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import TransactionItem, { WalletTransaction } from './TransactionItem';
import { THEME } from './theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loading from '../constant/Loading';
import styles from './PendingPaidTabs.style';


type WalletTab = 'pending' | 'paid';

type PendingPaidTabsProps = {
  pendingItems: WalletTransaction[];
  paidItems: WalletTransaction[];
  loading?: boolean;
  error?: string | null;
  onRecordPress?: (item: WalletTransaction) => void;
};

const TOGGLE_SHELL_PADDING = 6;

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
    const innerWidth = Math.max(
      0,
      event.nativeEvent.layout.width - TOGGLE_SHELL_PADDING * 2,
    );
    setTabWidth(innerWidth / 2);
  };

  const renderLoadingState = () => (
    <View style={styles.stateContainer}>
      <Loading size="small" text={null} />
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

export default PendingPaidTabs;
