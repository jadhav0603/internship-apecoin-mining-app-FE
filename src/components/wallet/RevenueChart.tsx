import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONTS } from '../../constants/FONTS';
import NeonBorderCard from './NeonBorderCard';
import { THEME, formatCompactValue } from './theme';

type RevenueChartProps = {
  miningTotal: number;
  rewardTotal: number;
  referralTotal: number;
};

type RevenueKey = 'mining' | 'reward' | 'referral';

type DayDatum = {
  day: string;
  mining: number;
  reward: number;
  referral: number;
};

const CHART_HEIGHT = 160;
const BAR_WIDTH = 8;
const BAR_GAP = 3;
const COLUMN_GAP = 14;

const BAR_CONFIG: Record<
  RevenueKey,
  { label: string; color: string; glowColor?: string }
> = {
  mining: { label: 'Mining', color: THEME.barMining, glowColor: THEME.neonGreen },
  reward: { label: 'Reward', color: THEME.barReward, glowColor: '#F5F5F5' },
  referral: { label: 'Referral', color: THEME.barReferral, glowColor: THEME.neonGreenDim },
};

const DUMMY_WEEK_DATA: DayDatum[] = [
  { day: 'Mon', mining: 65, reward: 45, referral: 30 },
  { day: 'Tue', mining: 80, reward: 60, referral: 40 },
  { day: 'Wed', mining: 55, reward: 50, referral: 35 },
  { day: 'Thu', mining: 90, reward: 70, referral: 45 },
  { day: 'Fri', mining: 75, reward: 55, referral: 38 },
  { day: 'Sat', mining: 95, reward: 65, referral: 42 },
  { day: 'Sun', mining: 0, reward: 0, referral: 0 },
];

const BAR_ORDER: RevenueKey[] = ['mining', 'reward', 'referral'];

const getTodayLabel = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);

const getLiveProgress = (date: Date) => {
  const secondsSinceMidnight =
    date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();

  return secondsSinceMidnight / 86400;
};

const RevenueChart = ({
  miningTotal,
  rewardTotal,
  referralTotal,
}: RevenueChartProps) => {
  const [now, setNow] = useState(() => new Date());
  const animatedBars = useRef<Record<string, Animated.Value>>({});
  const hasMountedAnimation = useRef(false);

  const todayLabel = useMemo(() => getTodayLabel(now), [now]);
  const liveProgress = useMemo(() => getLiveProgress(now), [now]);

  DUMMY_WEEK_DATA.forEach(entry => {
    BAR_ORDER.forEach(key => {
      const id = `${entry.day}-${key}`;
      if (!animatedBars.current[id]) {
        animatedBars.current[id] = new Animated.Value(0);
      }
    });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getTargetHeight = (entry: DayDatum, key: RevenueKey) => {
      const baseHeight = (entry[key] / 100) * CHART_HEIGHT;
      return entry.day === todayLabel ? baseHeight * liveProgress : baseHeight;
    };

    if (!hasMountedAnimation.current) {
      const introAnimations = DUMMY_WEEK_DATA.flatMap(entry =>
        BAR_ORDER.map(key =>
          Animated.spring(animatedBars.current[`${entry.day}-${key}`], {
            toValue: getTargetHeight(entry, key),
            useNativeDriver: false,
            tension: 40,
            friction: 7,
          }),
        ),
      );

      Animated.stagger(60, introAnimations).start();
      hasMountedAnimation.current = true;
      return;
    }

    DUMMY_WEEK_DATA.forEach(entry => {
      BAR_ORDER.forEach(key => {
        Animated.timing(animatedBars.current[`${entry.day}-${key}`], {
          toValue: getTargetHeight(entry, key),
          duration: 700,
          useNativeDriver: false,
        }).start();
      });
    });
  }, [liveProgress, todayLabel]);

  const legendItems = [
    {
      key: 'mining',
      label: 'Mining',
      value: formatCompactValue(miningTotal),
      color: THEME.barMining,
    },
    {
      key: 'reward',
      label: 'Reward',
      value: formatCompactValue(rewardTotal),
      color: THEME.barReward,
    },
    {
      key: 'referral',
      label: 'Referral',
      value: formatCompactValue(referralTotal),
      color: THEME.barReferral,
    },
  ];

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
              {
                bottom:
                  line === 3 ? CHART_HEIGHT - 1 : (CHART_HEIGHT / 3) * line,
              },
            ]}
          />
        ))}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartScrollContent}
        >
          {DUMMY_WEEK_DATA.map((entry, index) => {
            const isToday = entry.day === todayLabel;

            return (
              <View
                key={entry.day}
                style={[
                  styles.dayColumn,
                  index < DUMMY_WEEK_DATA.length - 1 && {
                    marginRight: COLUMN_GAP,
                  },
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
              <Text style={styles.legendValue}>{item.value}</Text>
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
});

export default RevenueChart;
