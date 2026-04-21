import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONTS } from '../../constants/FONTS';
import type { MiningHistoryDatum } from '../../hooks/useMiningWalletData';
import type { WeekDayDatum } from '../../hooks/useRewardsData';
import type { ReferralWeekDatum } from '../../services/referralService';
import NeonBorderCard from './NeonBorderCard';
import { THEME, formatCompactValue } from './theme';

type RevenueChartProps = {
  weekData: WeekDayDatum[];
  totalCollected: number;
  miningHistory: MiningHistoryDatum[];
  miningTotal: number;
  referralWeekData: ReferralWeekDatum[];
  referralEarnings: number;
  loading: boolean;
  miningLoading: boolean;
  referralLoading: boolean;
};

type RevenueKey = 'mining' | 'reward' | 'referral';

type DayDatum = {
  day: string;
  mining: number;
  reward: number;
  referral: number;
};

type BaseHistoryDatum = {
  date: string;
  dayLabel: string;
  totalAmount: number;
};

const CHART_HEIGHT = 160;
const BAR_WIDTH = 8;
const BAR_GAP = 3;
const COLUMN_GAP = 14;

const BAR_CONFIG: Record<RevenueKey, { label: string; color: string; glowColor?: string }> = {
  mining: { label: 'Mining', color: THEME.barMining, glowColor: THEME.neonGreen },
  reward: { label: 'Reward', color: THEME.barReward, glowColor: '#F5F5F5' },
  referral: { label: 'Referral', color: THEME.barReferral, glowColor: THEME.neonGreenDim },
};

const BAR_ORDER: RevenueKey[] = ['mining', 'reward', 'referral'];

const getTodayUtcLabel = () => {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return labels[new Date().getUTCDay()];
};

const RevenueChart = ({
  weekData,
  totalCollected,
  miningHistory,
  miningTotal,
  referralWeekData,
  referralEarnings,
  loading,
  miningLoading,
  referralLoading,
}: RevenueChartProps) => {
  const animatedBars = useRef<Record<string, Animated.Value>>({});
  const hasMountedAnimation = useRef(false);

  const todayLabel = useMemo(getTodayUtcLabel, []);

  const combinedData: DayDatum[] = useMemo(() => {
    // We want to ensure we always have 7 days of data points for a consistent graph baseline.
    // We prioritize using the dates provided by the miningHistory or weekData, but if those are empty,
    // we use a generated last-7-days window.
    
    const now = new Date();
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days: BaseHistoryDatum[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push({
        date: dateStr,
        dayLabel: dayLabels[d.getUTCDay()],
        totalAmount: 0
      });
    }

    const baseData = last7Days;

    const rewardByDate = new Map(
      weekData.map(entry => [entry.date, entry.totalAmount] as const)
    );
    const miningByDate = new Map(
      miningHistory.map(entry => [entry.date, entry.totalAmount] as const)
    );
    const referralByDate = new Map(
      referralWeekData.map(entry => [entry.date, entry.totalAmount] as const)
    );
    
    // Find absolute maximum across all sources for relative scaling
    const allAmounts = [
      ...weekData.map(d => d.totalAmount),
      ...miningHistory.map(d => d.totalAmount),
      ...referralWeekData.map(d => d.totalAmount)
    ];
    const maxAmount = Math.max(...allAmounts, 1.0); // scale against at least 1 unit if they are all 0

    return baseData.map(entry => {
      const rewardAmount = rewardByDate.get(entry.date) ?? 0;
      const miningAmount = miningByDate.get(entry.date) ?? 0;
      const referralAmount = referralByDate.get(entry.date) ?? 0;

      return {
        day: entry.dayLabel,
        // Scale to 0-80% height for visual balance in the chart
        mining: (miningAmount / maxAmount) * 80,
        reward: (rewardAmount / maxAmount) * 80,
        referral: (referralAmount / maxAmount) * 80,
      };
    });
  }, [weekData, miningHistory, referralWeekData]);

  combinedData.forEach(entry => {
    BAR_ORDER.forEach(key => {
      const id = `${entry.day}-${key}`;
      if (!animatedBars.current[id]) {
        animatedBars.current[id] = new Animated.Value(0);
      }
    });
  });

  useEffect(() => {
    if (combinedData.length === 0) {
      return;
    }

    const getTargetHeight = (entry: DayDatum, key: RevenueKey) =>
      (entry[key] / 100) * CHART_HEIGHT;

    if (!hasMountedAnimation.current) {
      const introAnimations = combinedData.flatMap(entry =>
        BAR_ORDER.map(key =>
          Animated.spring(animatedBars.current[`${entry.day}-${key}`], {
            toValue: getTargetHeight(entry, key),
            useNativeDriver: false,
            tension: 40,
            friction: 7,
          })
        )
      );

      Animated.stagger(60, introAnimations).start();
      hasMountedAnimation.current = true;
      return;
    }

    combinedData.forEach(entry => {
      BAR_ORDER.forEach(key => {
        Animated.timing(animatedBars.current[`${entry.day}-${key}`], {
          toValue: getTargetHeight(entry, key),
          duration: 700,
          useNativeDriver: false,
        }).start();
      });
    });
  }, [combinedData]);

  const legendItems = [
    { key: 'mining', label: 'Mining', value: formatCompactValue(miningTotal), color: THEME.barMining },
    { key: 'reward', label: 'Reward', value: formatCompactValue(totalCollected), color: THEME.barReward },
    { key: 'referral', label: 'Referral', value: formatCompactValue(referralEarnings), color: THEME.barReferral },
  ] as const;

  return (
    <NeonBorderCard style={styles.chartCard}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Revenue Overview</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>This Week</Text>
        </View>
      </View>

      <View style={styles.chartWrap}>
        {[1, 2, 3].map(line => (
          <View
            key={line}
            style={[
              styles.dashLine,
              { bottom: line === 3 ? CHART_HEIGHT - 1 : (CHART_HEIGHT / 3) * line },
            ]}
          />
        ))}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartScrollContent}
        >
          {combinedData.map((entry, index) => {
            const isToday = entry.day === todayLabel;

            return (
              <View
                key={entry.day}
                style={[
                  styles.dayColumn,
                  index < combinedData.length - 1 && { marginRight: COLUMN_GAP },
                ]}
              >
                <View style={styles.barTrack}>
                  <View style={styles.barGroup}>
                    {BAR_ORDER.map(key => (
                      <Animated.View
                        key={`${entry.day}-${key}`}
                        style={[
                          styles.bar,
                          {
                            backgroundColor: BAR_CONFIG[key].color,
                            height: animatedBars.current[`${entry.day}-${key}`],
                            marginHorizontal: BAR_GAP / 2,
                          },
                          isToday && styles.todayBarGlow,
                          isToday &&
                            BAR_CONFIG[key].glowColor && {
                              shadowColor: BAR_CONFIG[key].glowColor,
                            },
                        ]}
                      />
                    ))}
                  </View>
                </View>

                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                  {entry.day}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.legendRow}>
        {legendItems.map((item, index) => (
          <React.Fragment key={item.key}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
              {(item.key === 'reward' && loading) ||
              (item.key === 'mining' && miningLoading) ||
              (item.key === 'referral' && referralLoading) ? (
                <ActivityIndicator size="small" color={THEME.white} style={styles.legendLoader} />
              ) : (
                <Text style={styles.legendValue}>{item.value}</Text>
              )}
            </View>

            {index < legendItems.length - 1 && <View style={styles.legendDivider} />}
          </React.Fragment>
        ))}
      </View>
    </NeonBorderCard>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: THEME.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  badge: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.neonGreen,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#2a2a1a',
  },
  badgeText: {
    color: THEME.neonGreen,
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  chartWrap: {
    marginTop: 22,
    height: CHART_HEIGHT + 30,
    justifyContent: 'flex-end',
  },
  dashLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: '#3a3a3a',
  },
  chartScrollContent: {
    minWidth: '100%',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barTrack: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  barGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  todayBarGlow: {
    shadowOpacity: 0.92,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  dayLabel: {
    marginTop: 12,
    color: '#7f7f7f',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  dayLabelToday: {
    color: THEME.neonGreen,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.borderMuted,
  },
  legendItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  legendLabel: {
    color: THEME.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  legendValue: {
    color: THEME.white,
    fontSize: 18,
    fontFamily: FONTS.black,
    fontWeight: '800',
    marginTop: 4,
  },
  legendDivider: {
    width: 1,
    backgroundColor: THEME.borderMuted,
    marginHorizontal: 4,
  },
  legendLoader: {
    marginTop: 4,
  },
});

export default RevenueChart;
