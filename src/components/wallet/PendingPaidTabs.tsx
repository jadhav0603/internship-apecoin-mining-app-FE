import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONTS } from '../../constants/FONTS';
import TransactionItem, { WalletTransaction } from './TransactionItem';
import { THEME } from './theme';

type WalletTab = 'pending' | 'paid';

const PENDING_ITEMS: WalletTransaction[] = [
  {
    id: '1',
    type: 'Mining Reward',
    amount: '+245.00 APC',
    date: 'Today, 11:30 AM',
    status: 'pending',
  },
  {
    id: '2',
    type: 'Referral Bonus',
    amount: '+50.00 APC',
    date: 'Today, 09:15 AM',
    status: 'pending',
  },
  {
    id: '3',
    type: 'Daily Reward',
    amount: '+100.00 APC',
    date: 'Yesterday, 11:59 PM',
    status: 'pending',
  },
  {
    id: '4',
    type: 'Mining Reward',
    amount: '+310.00 APC',
    date: 'Yesterday, 06:00 PM',
    status: 'pending',
  },
];

const PAID_ITEMS: WalletTransaction[] = [
  {
    id: '1',
    type: 'Mining Reward',
    amount: '+800.00 APC',
    date: 'Apr 14, 2025',
    status: 'paid',
  },
  {
    id: '2',
    type: 'Referral Bonus',
    amount: '+200.00 APC',
    date: 'Apr 13, 2025',
    status: 'paid',
  },
  {
    id: '3',
    type: 'Daily Reward',
    amount: '+150.00 APC',
    date: 'Apr 12, 2025',
    status: 'paid',
  },
  {
    id: '4',
    type: 'Mining Reward',
    amount: '+1200.00 APC',
    date: 'Apr 10, 2025',
    status: 'paid',
  },
  {
    id: '5',
    type: 'Referral Bonus',
    amount: '+300.00 APC',
    date: 'Apr 08, 2025',
    status: 'paid',
  },
];

const MAX_TRANSACTION_COUNT = Math.max(PENDING_ITEMS.length, PAID_ITEMS.length);

const PendingPaidTabs = () => {
  const [activeTab, setActiveTab] = useState<WalletTab>('pending');
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const slideAnims = useRef(
    Array.from({ length: MAX_TRANSACTION_COUNT }, () => new Animated.Value(22)),
  ).current;
  const itemOpacities = useRef(
    Array.from({ length: MAX_TRANSACTION_COUNT }, () => new Animated.Value(0)),
  ).current;

  const activeItems = useMemo(
    () => (activeTab === 'pending' ? PENDING_ITEMS : PAID_ITEMS),
    [activeTab],
  );

  useEffect(() => {
    slideAnims.forEach((anim, index) => {
      anim.setValue(index < activeItems.length ? 18 : 0);
    });
    itemOpacities.forEach((anim, index) => {
      anim.setValue(index < activeItems.length ? 0 : 1);
    });
    contentOpacity.setValue(0);

    const fadeIn = Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });
    const staggeredCards = Animated.stagger(
      70,
      activeItems.map((_, index) =>
        Animated.parallel([
          Animated.timing(slideAnims[index], {
            toValue: 0,
            duration: 340,
            useNativeDriver: true,
          }),
          Animated.timing(itemOpacities[index], {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    Animated.parallel([fadeIn, staggeredCards]).start();
  }, [activeItems, contentOpacity, itemOpacities, slideAnims]);

  const handleTabPress = (nextTab: WalletTab) => {
    if (nextTab === activeTab) {
      return;
    }

    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(nextTab);
    });
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

      <Animated.View style={[styles.listContainer, { opacity: contentOpacity }]}>
        {activeItems.map((item, index) => (
          <Animated.View
            key={`${activeTab}-${item.id}`}
            style={{
              opacity: itemOpacities[index],
              transform: [{ translateY: slideAnims[index] }],
            }}
          >
            <TransactionItem item={item} />
          </Animated.View>
        ))}
      </Animated.View>
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
});

export default PendingPaidTabs;
