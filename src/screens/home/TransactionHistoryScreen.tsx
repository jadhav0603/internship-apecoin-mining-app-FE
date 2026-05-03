import React, { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StatusBar,
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppBackButton from '../../components/navigation/AppBackButton';
import Loading from '../../components/constant/Loading';
import { COLORS } from '../../constants/COLORS';
import MultiLineChart, {
  type MultiLineChartData,
  type MultiLineChartFilter,
} from '../../components/transactions/CurvedEarningsGraph';
import { getUserDisplayName, useUser } from '../../context/UserContext';
import type { RootStackParamList } from '../../navigation/types';
import {
  transactionService,
  type TransactionHistorySummary,
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
const DEFAULT_HISTORY_LIMIT = 200;

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

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
};

const getFallbackMonthKeys = (count = 6) => {
  const baseDate = new Date();

  return Array.from({ length: count }, (_, index) => {
    const nextDate = new Date(
      Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() - index, 1),
    );

    return `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, '0')}`;
  });
};

const formatMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) {
    return monthKey;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
};

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
    case 'pending':
      return {
        backgroundColor: 'rgba(255, 199, 0, 0.14)',
        borderColor: 'rgba(255, 199, 0, 0.28)',
        textColor: '#F5C542',
        label: 'Pending',
      };
    case 'withdrawn':
      return {
        backgroundColor: 'rgba(255, 92, 92, 0.14)',
        borderColor: 'rgba(255, 92, 92, 0.28)',
        textColor: '#FF8585',
        label: 'Withdrawn',
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

const buildEmptySummary = (month: string): TransactionHistorySummary => ({
  month,
  points: [],
  availableMonths: [month],
  totals: {
    totalMining: 0,
    totalReward: 0,
    totalReferral: 0,
    totalWithdrawal: 0,
  },
  totalTransactions: 0,
  hasData: false,
});

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

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TransactionHistoryRouteProp>();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const refreshKey = route.params?.refreshKey;
  const currentMonthKey = useMemo(() => getCurrentMonthKey(), []);

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [summary, setSummary] = useState<TransactionHistorySummary>(
    buildEmptySummary(currentMonthKey),
  );
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);

  const loadTransactions = useCallback(
    async (showLoader: boolean) => {
      try {
        setError(null);

        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const [historyData, summaryData] = await Promise.all([
          transactionService.getHistory({
            month: selectedMonth,
            limit: DEFAULT_HISTORY_LIMIT,
          }),
          transactionService.getHistorySummary(selectedMonth),
        ]);

        setTransactions(historyData);
        setSummary(summaryData);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          (err?.message === 'Network Error'
            ? 'Unable to reach the server. Check your connection.'
            : 'Failed to load transaction history.');

        setTransactions([]);
        setSummary(buildEmptySummary(selectedMonth));
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedMonth],
  );

  useFocusEffect(
    useCallback(() => {
      void loadTransactions(true);
    }, [loadTransactions, refreshKey]),
  );

  const filteredTransactions = useMemo(() => {
    return activeFilter === 'all'
      ? transactions
      : transactions.filter(item => item.type === activeFilter);
  }, [activeFilter, transactions]);

  const chartData = useMemo<MultiLineChartData>(() => {
    return {
      labels: summary.points.map(point => point.day),
      miningEarning: summary.points.map(point => point.totalMining ?? 0),
      rewardEarning: summary.points.map(point => point.totalReward ?? 0),
      referralEarning: summary.points.map(point => point.totalReferral ?? 0),
    };
  }, [summary.points]);

  const activePointIndex = useMemo(() => {
    if (!summary.points.length) {
      return 0;
    }

    const getPointValue = (index: number) => {
      const point = summary.points[index];
      if (!point) {
        return 0;
      }

      if (activeFilter === 'mining') {
        return point.totalMining ?? 0;
      }

      if (activeFilter === 'reward') {
        return point.totalReward ?? 0;
      }

      if (activeFilter === 'referral') {
        return point.totalReferral ?? 0;
      }

      return (
        (point.totalMining ?? 0) +
        (point.totalReward ?? 0) +
        (point.totalReferral ?? 0)
      );
    };

    for (let index = summary.points.length - 1; index >= 0; index -= 1) {
      if (getPointValue(index) > 0) {
        return index;
      }
    }

    return summary.points.length - 1;
  }, [activeFilter, summary.points]);

  const activePointValue = useMemo(() => {
    const point = summary.points[activePointIndex];
    if (!point) {
      return 0;
    }

    if (activeFilter === 'mining') {
      return point.totalMining ?? 0;
    }

    if (activeFilter === 'reward') {
      return point.totalReward ?? 0;
    }

    if (activeFilter === 'referral') {
      return point.totalReferral ?? 0;
    }

    return (
      (point.totalMining ?? 0) +
      (point.totalReward ?? 0) +
      (point.totalReferral ?? 0)
    );
  }, [activeFilter, activePointIndex, summary.points]);

  const totalForFilter = useMemo(() => {
    if (activeFilter === 'mining') {
      return summary.totals.totalMining ?? 0;
    }

    if (activeFilter === 'reward') {
      return summary.totals.totalReward ?? 0;
    }

    if (activeFilter === 'referral') {
      return summary.totals.totalReferral ?? 0;
    }

    return (
      (summary.totals.totalMining ?? 0) +
      (summary.totals.totalReward ?? 0) +
      (summary.totals.totalReferral ?? 0) -
      (summary.totals.totalWithdrawal ?? 0)
    );
  }, [activeFilter, summary.totals]);

  const hasGraphData = useMemo(() => {
    if (!summary.hasData) {
      return false;
    }

    if (activeFilter === 'mining') {
      return (summary.totals.totalMining ?? 0) > 0;
    }

    if (activeFilter === 'reward') {
      return (summary.totals.totalReward ?? 0) > 0;
    }

    if (activeFilter === 'referral') {
      return (summary.totals.totalReferral ?? 0) > 0;
    }

    return (
      (summary.totals.totalMining ?? 0) > 0 ||
      (summary.totals.totalReward ?? 0) > 0 ||
      (summary.totals.totalReferral ?? 0) > 0
    );
  }, [activeFilter, summary.hasData, summary.totals]);

  const monthOptions = useMemo(() => {
    const fallbackMonths = getFallbackMonthKeys();
    const optionSet = new Set<string>([
      selectedMonth,
      currentMonthKey,
      ...summary.availableMonths,
      ...fallbackMonths,
    ]);

    return Array.from(optionSet).sort((left, right) => right.localeCompare(left));
  }, [currentMonthKey, selectedMonth, summary.availableMonths]);

  const renderTransaction = useCallback(
    ({ item }: { item: TransactionItem }) => <TransactionRow item={item} />,
    [],
  );

  const listHeaderComponent = (
    <View>
      <View
        style={[
          styles.headerRow,
          { paddingTop: Math.max(insets.top > 0 ? 4 : 18, 4) },
        ]}
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

      {hasGraphData ? (
        <MultiLineChart
          data={chartData}
          filter={activeFilter as MultiLineChartFilter}
          activeIndex={activePointIndex}
          valueText={formatAmount(activePointValue)}
        />
      ) : (
        <View style={styles.graphEmptyState}>
          <Text style={styles.emptyTitle}>No graph data</Text>
          <Text style={styles.emptyText}>
            No transaction activity is available for {formatMonthLabel(selectedMonth)}.
          </Text>
        </View>
      )}

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryEyebrow}>My Transactions</Text>
          <Text style={styles.summaryTitle}>
            Track every earning in one place
          </Text>
        </View>

        <View style={styles.summaryBadgeColumn}>
          <Pressable
            style={styles.monthPickerButton}
            onPress={() => setIsMonthModalVisible(true)}
          >
            <Text style={styles.monthPickerText}>
              {formatMonthLabel(selectedMonth)}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={COLORS.textPrimary}
            />
          </Pressable>

          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>
              {filteredTransactions.length} items
            </Text>
          </View>
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
          {totalForFilter >= 0 ? '+' : '-'} {formatAmount(Math.abs(totalForFilter))} APE
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BACKGROUND} />

      {loading ? (
        <Loading fullScreen size="medium" text="Loading transactions..." />
      ) : (
        <>
          <FlatList
            data={filteredTransactions}
            keyExtractor={item => item.id}
            renderItem={renderTransaction}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={7}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={listHeaderComponent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  {error ? 'Unable to load transactions' : 'No transactions found'}
                </Text>
                <Text style={styles.emptyText}>
                  {error ??
                    `No transactions are available for ${formatMonthLabel(selectedMonth)}.`}
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

          <Modal
            visible={isMonthModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsMonthModalVisible(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setIsMonthModalVisible(false)}
            >
              <View style={styles.monthModalCard}>
                <Text style={styles.monthModalTitle}>Select Month</Text>

                {monthOptions.map(month => {
                  const isActive = month === selectedMonth;

                  return (
                    <Pressable
                      key={month}
                      style={[styles.monthOption, isActive && styles.monthOptionActive]}
                      onPress={() => {
                        setSelectedMonth(month);
                        setIsMonthModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.monthOptionText,
                          isActive && styles.monthOptionTextActive,
                        ]}
                      >
                        {formatMonthLabel(month)}
                      </Text>
                      {isActive ? (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={COLORS.primary}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

export default TransactionHistoryScreen;
