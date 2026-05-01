import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Animated,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AppBackButton from '../../components/navigation/AppBackButton';
import Loading from '../../components/constant/Loading';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import MultiLineChart, {
  type MultiLineChartData,
  type MultiLineChartFilter,
} from '../../components/transactions/CurvedEarningsGraph';
import { getUserDisplayName, useUser } from '../../context/UserContext';
import type { RootStackParamList } from '../../navigation/types';
import {
  transactionService,
  type TransactionItem,
  type TransactionType,
} from '../../services/transactionService';
import { formatTransactionDateTime } from '../../utils/dateFormatters';
import styles from './TransactionHistoryScreen.style';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionHistory'
>;
type TransactionHistoryRouteProp = RouteProp<
  RootStackParamList,
  'TransactionHistory'
>;

type FilterKey = 'all' | TransactionType;

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'reward', label: 'Reward' },
  { key: 'mining', label: 'Mining' },
  { key: 'referral', label: 'Referral' },
];

const SCREEN_BACKGROUND = COLORS.backgroundDeep;
const CHART_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'] as const;
const ACTIVE_MONTH_INDEX = 3;

const formatAmount = (amount: number) =>
  amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });

const formatTransactionAmount = (amount: number) =>
  Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 6,
  });

const getSignedAmount = (item: TransactionItem) =>
  item.isCredit ? item.amount : -item.amount;

const getTypeBadgeStyle = (type: TransactionType) => {
  switch (type) {
    case 'reward':
      return {
        backgroundColor: '#FFF4D6',
        emoji: '🎁',
      };
    case 'mining':
      return {
        backgroundColor: '#DDF7E7',
        emoji: '⛏️',
      };
    case 'referral':
      return {
        backgroundColor: '#E6EDFF',
        emoji: '👥',
      };
  }
};

const getStatusBadgeStyle = (status: TransactionItem['status']) => {
  switch (status) {
    case 'withdrawn':
      return {
        backgroundColor: 'rgba(255, 92, 92, 0.14)',
        borderColor: 'rgba(255, 92, 92, 0.28)',
        textColor: '#FF8585',
        label: 'Withdrawn',
      };
    case 'pending':
      return {
        backgroundColor: 'rgba(255, 199, 0, 0.14)',
        borderColor: 'rgba(255, 199, 0, 0.28)',
        textColor: '#F5C542',
        label: 'Pending',
      };
    default:
      return {
        backgroundColor: 'rgba(72, 205, 120, 0.14)',
        borderColor: 'rgba(72, 205, 120, 0.28)',
        textColor: '#6FE39A',
        label: 'Claimed',
      };
  }
};

const TransactionRow = ({ item }: { item: TransactionItem }) => {
  const badge = getTypeBadgeStyle(item.type);
  const statusBadge = getStatusBadgeStyle(item.status);
  const scale = useState(new Animated.Value(1))[0];

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPressIn={() => animateTo(0.98)}
      onPressOut={() => animateTo(1)}
      style={({ pressed }) => [
        styles.transactionPressable,
        pressed && styles.transactionPressed,
      ]}
    >
      <Animated.View
        style={[styles.transactionRow, { transform: [{ scale }] }]}
      >
        <View
          style={[
            styles.transactionIconWrap,
            { backgroundColor: badge.backgroundColor },
          ]}
        >
          <Text style={styles.transactionEmoji}>{badge.emoji}</Text>
        </View>

        <View style={styles.transactionBody}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.transactionMetaRow}>
            <Text style={styles.transactionMetaText}>
              {formatTransactionDateTime(item.date)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusBadge.backgroundColor,
                  borderColor: statusBadge.borderColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: statusBadge.textColor },
                ]}
              >
                {statusBadge.label}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.amountText,
            item.isCredit ? styles.amountCredit : styles.amountDebit,
          ]}
        >
          {item.isCredit ? '+' : '-'}
          {formatTransactionAmount(item.amount)}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const buildMultiLineChartData = (
  transactions: TransactionItem[],
): MultiLineChartData => {
  const rewardEarning = Array(CHART_LABELS.length).fill(0);
  const miningEarning = Array(CHART_LABELS.length).fill(0);
  const referralEarning = Array(CHART_LABELS.length).fill(0);

  transactions.forEach(item => {
    const date = new Date(item.date);
    const monthIndex = date.getUTCMonth();

    if (monthIndex < 0 || monthIndex >= CHART_LABELS.length) {
      return;
    }

    if (item.type === 'reward') {
      rewardEarning[monthIndex] += item.amount;
      return;
    }

    if (item.type === 'mining') {
      miningEarning[monthIndex] += item.amount;
      return;
    }

    referralEarning[monthIndex] += item.amount;
  });

  return {
    labels: [...CHART_LABELS],
    rewardEarning,
    miningEarning,
    referralEarning,
  };
};

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TransactionHistoryRouteProp>();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const refreshKey = route.params?.refreshKey;

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async (showLoader: boolean) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const data = await transactionService.getHistory();
      setTransactions(data);
      setError(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (err?.message === 'Network Error'
          ? 'Unable to reach the server. Check your connection.'
          : 'Failed to load transaction history.');

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions(true).catch(() => undefined);
    }, [loadTransactions, refreshKey]),
  );

  const filteredTransactions = useMemo(() => {
    return activeFilter === 'all'
      ? transactions
      : transactions.filter(item => item.type === activeFilter);
  }, [activeFilter, transactions]);

  const chartData = useMemo(
    () => buildMultiLineChartData(filteredTransactions),
    [filteredTransactions],
  );

  const totalForFilter = useMemo(
    () =>
      filteredTransactions.reduce(
        (sum, item) => sum + getSignedAmount(item),
        0,
      ),
    [filteredTransactions],
  );

  const activeMonthValue = useMemo(() => {
    const rewardValue = chartData.rewardEarning[ACTIVE_MONTH_INDEX] ?? 0;
    const miningValue = chartData.miningEarning[ACTIVE_MONTH_INDEX] ?? 0;
    const referralValue = chartData.referralEarning[ACTIVE_MONTH_INDEX] ?? 0;

    return rewardValue + miningValue + referralValue;
  }, [chartData]);

  const renderTransaction = useCallback(
    ({ item }: { item: TransactionItem }) => <TransactionRow item={item} />,
    [],
  );

  const listHeaderComponent = (
    <View>
      <View
        style={[styles.headerRow, { paddingTop: Math.max(insets.top + 4, 18) }]}
      >
        <AppBackButton onPress={() => navigation.goBack()} />

        <Text style={styles.headerTitle}>My Transactions</Text>

        <Pressable
          onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
        >
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {getUserDisplayName(user).charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <MultiLineChart
        data={chartData}
        filter={activeFilter as MultiLineChartFilter}
        activeIndex={ACTIVE_MONTH_INDEX}
        valueText={formatAmount(activeMonthValue)}
      />

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryEyebrow}>My Transactions</Text>
          <Text style={styles.summaryTitle}>
            Track every earning in one place
          </Text>
        </View>
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryBadgeText}>
            {filteredTransactions.length} items
          </Text>
        </View>
      </View>

      <View style={styles.totalStrip}>
        <Text style={styles.totalStripLabel}>Filtered Total</Text>
        <Text
          style={[
            styles.totalStripValue,
            totalForFilter >= 0 ? styles.amountCredit : styles.amountDebit,
          ]}
        >
          {totalForFilter >= 0 ? '+' : '-'}{' '}
          {formatAmount(Math.abs(totalForFilter))} APE
        </Text>
      </View>

      <View style={styles.filtersRow}>
        {FILTERS.map(filter => {
          const active = filter.key === activeFilter;

          return (
            <Pressable
              key={filter.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Transaction List</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BACKGROUND} />

      {loading ? (
        <Loading fullScreen size="medium" text="Loading transactions..." />
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={listHeaderComponent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {error
                  ? 'Unable to load transactions'
                  : 'No transactions found'}
              </Text>
              <Text style={styles.emptyText}>
                {error ??
                  'Try another filter or come back after new earnings are added.'}
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTransactions(false)}
              tintColor={COLORS.primaryDark}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default TransactionHistoryScreen;
