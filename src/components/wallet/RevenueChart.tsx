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
import NeonBorderCard from './NeonBorderCard';
import { THEME, formatCompactValue } from './theme';
import type { WeekDayDatum } from '../../hooks/useRewardsData';

// ─── Types ────────────────────────────────────────────────────────────────────

type RevenueChartProps = {
  weekData: WeekDayDatum[];
  totalCollected: number;
  loading: boolean;
};

// ─── Layout constants ─────────────────────────────────────────────────────────

const CHART_HEIGHT = 160;
const BAR_WIDTH = 22;
const COLUMN_GAP = 14;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the UTC day label (e.g. "Mon") for today. */
const getTodayUtcLabel = () => {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return labels[new Date().getUTCDay()];
};

// ─── Skeleton bar (shown while loading) ──────────────────────────────────────

const SkeletonBar = ({ height }: { height: number }) => (
  <View
    style={[
      styles.bar,
      {
        height,
        backgroundColor: '#2a2a2a',
        opacity: 0.6,
      },
    ]}
  />
);

// ─── Component ────────────────────────────────────────────────────────────────

const RevenueChart = ({ weekData, totalCollected, loading }: RevenueChartProps) => {
  const animatedBars = useRef<Record<string, Animated.Value>>({});
  const hasMountedAnimation = useRef(false);

  const todayLabel = useMemo(getTodayUtcLabel, []);

  // Ensure Animated.Values exist for every entry
  weekData.forEach(entry => {
    if (!animatedBars.current[entry.date]) {
      animatedBars.current[entry.date] = new Animated.Value(0);
    }
  });

  // Compute the max amount for scaling bars proportionally
  const maxAmount = useMemo(
    () => Math.max(...weekData.map(d => d.totalAmount), 0.000001),
    [weekData]
  );

  useEffect(() => {
    if (loading || weekData.length === 0) return;

    const getTargetHeight = (entry: WeekDayDatum) =>
      (entry.totalAmount / maxAmount) * CHART_HEIGHT;

    if (!hasMountedAnimation.current) {
      const introAnimations = weekData.map(entry =>
        Animated.spring(animatedBars.current[entry.date], {
          toValue: getTargetHeight(entry),
          useNativeDriver: false,
          tension: 40,
          friction: 7,
        })
      );
      Animated.stagger(60, introAnimations).start();
      hasMountedAnimation.current = true;
      return;
    }

    weekData.forEach(entry => {
      Animated.timing(animatedBars.current[entry.date], {
        toValue: getTargetHeight(entry),
        duration: 700,
        useNativeDriver: false,
      }).start();
    });
  }, [weekData, maxAmount, loading]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <NeonBorderCard style={styles.chartCard}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Rewards Overview</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Last 7 Days</Text>
        </View>
      </View>

      {/* Chart area */}
      <View style={styles.chartWrap}>
        {/* Horizontal guide lines */}
        {[1, 2, 3].map(line => (
          <View
            key={line}
            style={[
              styles.dashLine,
              {
                bottom:
                  line === 3 ? CHART_HEIGHT - 1 : (CHART_HEIGHT / 3) * line,
              },
            ]}
          />
        ))}

        {loading ? (
          /* Skeleton bars while loading */
          <View style={styles.skeletonRow}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={i} style={styles.dayColumn}>
                <View style={styles.barTrack}>
                  <SkeletonBar height={Math.random() * 80 + 20} />
                </View>
                <View style={styles.skeletonLabel} />
              </View>
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContent}
          >
            {weekData.map((entry, index) => {
              const isToday = entry.dayLabel === todayLabel;

              return (
                <View
                  key={entry.date}
                  style={[
                    styles.dayColumn,
                    index < weekData.length - 1 && { marginRight: COLUMN_GAP },
                  ]}
                >
                  <View style={styles.barTrack}>
                    <Animated.View
                      style={[
                        styles.bar,
                        {
                          height: animatedBars.current[entry.date] ?? new Animated.Value(0),
                          backgroundColor: isToday ? THEME.neonGreen : THEME.barReward,
                        },
                        isToday && styles.todayBarGlow,
                      ]}
                    />
                  </View>

                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                    {entry.dayLabel}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: THEME.neonGreen }]} />
          <Text style={styles.legendLabel}>Daily Rewards</Text>
          {loading ? (
            <ActivityIndicator size="small" color={THEME.neonGreen} style={{ marginTop: 4 }} />
          ) : (
            <Text style={styles.legendValue}>{formatCompactValue(totalCollected)} APE</Text>
          )}
        </View>
      </View>
    </NeonBorderCard>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    height: CHART_HEIGHT + 30,
    alignItems: 'flex-end',
  },
  dayColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barTrack: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  todayBarGlow: {
    shadowColor: THEME.neonGreen,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
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
  skeletonLabel: {
    marginTop: 12,
    width: 24,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
    opacity: 0.5,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.borderMuted,
  },
  legendItem: {
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
});

export default RevenueChart;
