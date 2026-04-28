import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primaryDark} />
          <Text style={styles.centerStateText}>Loading transactions...</Text>
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerStateText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 15,
    fontFamily: FONTS.medium,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E2630',
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  summaryCard: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  summaryEyebrow: {
    color: COLORS.textPrimary,
    fontSize: 31,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  summaryTitle: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 220,
  },
  summaryBadge: {
    backgroundColor: 'rgba(166, 255, 0, 0.12)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  summaryBadgeText: {
    color: COLORS.success,
    fontSize: 12,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  totalStrip: {
    marginTop: 18,
    marginBottom: 18,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  totalStripLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  totalStripValue: {
    color: COLORS.success,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  filterChip: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.cardStrong,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.textDark,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    marginBottom: 14,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  transactionPressable: {
    borderRadius: 24,
  },
  transactionPressed: {
    opacity: 0.96,
  },
  transactionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionEmoji: {
    fontSize: 22,
  },
  transactionBody: {
    flex: 1,
    marginLeft: 14,
    marginRight: 12,
  },
  transactionTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  transactionMetaText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  transactionMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amountText: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  amountCredit: {
    color: COLORS.success,
  },
  amountDebit: {
    color: '#FF8585',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default TransactionHistoryScreen;
