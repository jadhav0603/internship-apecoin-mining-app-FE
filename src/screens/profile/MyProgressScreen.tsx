import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Dimensions,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { useMining } from '../../context/MiningContext';
import { useMiningWalletData } from '../../hooks/useMiningWalletData';
import { useReferralData } from '../../hooks/useReferralData';
import { useRewardsData } from '../../hooks/useRewardsData';
import { RootStackParamList } from '../../navigation/types';
import AppBackButton from '../../components/navigation/AppBackButton';
import styles from './MyProgressScreen.style';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 150; // Reduced height for simplified content
const CARD_SPACING = 16;
const CARD_FULL_SIZE = CARD_HEIGHT + CARD_SPACING;
const SIDE_PADDING = 20;
const FIXED_GRAPH_HEIGHT = 380;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProgressCardData {
  key: string;
  label: string;
  title: string;
  value: string;
  progress: number;
  icon: string;
  accent: string;
  gradient: [string, string];
  footer: string;
}

interface ProgressCardProps {
  item: ProgressCardData;
  index: number;
  scrollY: RNAnimated.Value;
}

type ChartSegment = {
  key: 'mining' | 'rewards' | 'referral';
  label: string;
  value: number;
  percentage: number;
  color: string;
};

const CHART_COLORS: Record<ChartSegment['key'], string> = {
  mining: '#4dacffff',
  rewards: '#ffd65cff',
  referral: '#cc5709ff',
};

const formatValue = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

const DonutChart = React.memo(
  ({ segments, total }: { segments: ChartSegment[]; total: number }) => {
    const size = 214;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const gapLength = 10;

    const miningShare = useSharedValue(0);
    const rewardsShare = useSharedValue(0);
    const referralShare = useSharedValue(0);

    useEffect(() => {
      const nextMining = segments.find(segment => segment.key === 'mining')?.percentage ?? 0;
      const nextRewards = segments.find(segment => segment.key === 'rewards')?.percentage ?? 0;
      const nextReferral = segments.find(segment => segment.key === 'referral')?.percentage ?? 0;

      miningShare.value = withTiming(nextMining, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
      rewardsShare.value = withTiming(nextRewards, {
        duration: 1300,
        easing: Easing.out(Easing.cubic),
      });
      referralShare.value = withTiming(nextReferral, {
        duration: 1400,
        easing: Easing.out(Easing.cubic),
      });
    }, [miningShare, referralShare, rewardsShare, segments]);

    const miningAnimatedProps = useAnimatedProps(() => {
      const visibleLength = Math.max(miningShare.value * circumference - gapLength, 0);
      return {
        strokeDasharray: [visibleLength, circumference],
        strokeDashoffset: 0,
      };
    });

    const rewardsAnimatedProps = useAnimatedProps(() => {
      const visibleLength = Math.max(rewardsShare.value * circumference - gapLength, 0);
      return {
        strokeDasharray: [visibleLength, circumference],
        strokeDashoffset: -(miningShare.value * circumference),
      };
    });

    const referralAnimatedProps = useAnimatedProps(() => {
      const visibleLength = Math.max(referralShare.value * circumference - gapLength, 0);
      return {
        strokeDasharray: [visibleLength, circumference],
        strokeDashoffset: -((miningShare.value + rewardsShare.value) * circumference),
      };
    });

    return (
      <View style={styles.donutCard}>
        <View style={styles.donutWrap}>
          <Svg width={size} height={size} style={styles.donutSvg}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={CHART_COLORS.mining}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              rotation={-90}
              originX={size / 2}
              originY={size / 2}
              animatedProps={miningAnimatedProps}
            />
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={CHART_COLORS.rewards}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              rotation={-90}
              originX={size / 2}
              originY={size / 2}
              animatedProps={rewardsAnimatedProps}
            />
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={CHART_COLORS.referral}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              rotation={-90}
              originX={size / 2}
              originY={size / 2}
              animatedProps={referralAnimatedProps}
            />
          </Svg>

          <View style={styles.centerContent}>
            <Text style={styles.centerLabel}>Total</Text>
            <Text style={styles.centerValue}>{formatValue(total)}</Text>
          </View>
        </View>

        <View style={styles.legendList}>
          {segments.map(segment => (
            <View key={segment.key} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                <Text style={styles.legendName}>{segment.label}</Text>
              </View>
              <Text style={styles.legendPercent}>
                {Math.round(segment.percentage * 100)}%
              </Text>
              <Text style={styles.legendValue}>{formatValue(segment.value)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  },
);

const ProgressCard: React.FC<ProgressCardProps> = ({ item, index, scrollY }) => {
  const inputRange = [
    (index - 1) * CARD_FULL_SIZE,
    index * CARD_FULL_SIZE,
    (index + 1) * CARD_FULL_SIZE,
  ];

  const scale = scrollY.interpolate({
    inputRange,
    outputRange: [0.9, 1.08, 0.9],
    extrapolate: 'clamp',
  });

  const opacity = scrollY.interpolate({
    inputRange,
    outputRange: [0.78, 1, 0.78],
    extrapolate: 'clamp',
  });

  const translateY = scrollY.interpolate({
    inputRange,
    outputRange: [18, 0, -18],
    extrapolate: 'clamp',
  });

  const glowOpacity = scrollY.interpolate({
    inputRange,
    outputRange: [0.08, 0.22, 0.08],
    extrapolate: 'clamp',
  });

  const shadowOpacity = scrollY.interpolate({
    inputRange,
    outputRange: [0.08, 0.24, 0.08],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.cardWrap}>
      <RNAnimated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
            backgroundColor: item.accent,
            transform: [{ scale }],
          },
        ]}
      />

      <RNAnimated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [{ translateY }, { scale }],
            shadowOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBackground}
        />

        <View style={styles.cardContent}>
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={[`${item.accent}22`, `${item.accent}08`]}
              style={styles.iconOverlay}
            />
            <Ionicons name={item.icon} size={26} color={item.accent} />
          </View>
          
          <View style={styles.textColumn}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        </View>
      </RNAnimated.View>
    </View>
  );
};

const MyProgressScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new RNAnimated.Value(0)).current;

  const { miningData, refreshMiningStatus } = useMining();
  const { miningTotal, refresh: refreshMiningWalletData } = useMiningWalletData();
  const { totalCollected, refresh: refreshRewardsData } = useRewardsData();
  const { referralCount, referralEarnings, refresh: refreshReferralData } =
    useReferralData();
  const [refreshing, setRefreshing] = useState(false);

  const miningGoal = 1000;
  const rewardGoal = 500;
  const referralGoal = 50;

  const miningProgress = Math.min((miningData?.totalEarned ?? 0) / miningGoal, 1);
  const rewardProgress = Math.min(totalCollected / rewardGoal, 1);
  const referralProgress = Math.min(referralCount / referralGoal, 1);

  const chartSegments = useMemo<ChartSegment[]>(() => {
    const total = miningTotal + totalCollected + referralEarnings;

    return [
      {
        key: 'mining',
        label: 'Mining',
        value: miningTotal,
        percentage: total > 0 ? miningTotal / total : 0,
        color: CHART_COLORS.mining,
      },
      {
        key: 'rewards',
        label: 'Rewards',
        value: totalCollected,
        percentage: total > 0 ? totalCollected / total : 0,
        color: CHART_COLORS.rewards,
      },
      {
        key: 'referral',
        label: 'Referral',
        value: referralEarnings,
        percentage: total > 0 ? referralEarnings / total : 0,
        color: CHART_COLORS.referral,
      },
    ];
  }, [miningTotal, referralEarnings, totalCollected]);

  const totalValue = useMemo(
    () => chartSegments.reduce((sum, segment) => sum + segment.value, 0),
    [chartSegments],
  );

  const cards = useMemo<ProgressCardData[]>(
    () => [
      {
        key: 'mining',
        label: 'Mining',
        title: 'Mining',
        value: `${(miningData?.totalEarned ?? 0).toFixed(2)} APC`,
        progress: miningProgress,
        icon: 'flash-outline',
        accent: '#A6FF00',
        gradient: ['rgba(22, 36, 11, 0.96)', 'rgba(8, 12, 8, 0.98)'],
        footer: '',
      },
      {
        key: 'rewards',
        label: 'Reward',
        title: 'Reward',
        value: `${totalCollected.toFixed(2)} APC`,
        progress: rewardProgress,
        icon: 'diamond-outline',
        accent: '#59FFC8',
        gradient: ['rgba(10, 31, 24, 0.96)', 'rgba(7, 12, 11, 0.98)'],
        footer: '',
      },
      {
        key: 'referrals',
        label: 'Referral',
        title: 'Referral',
        value: `${referralCount} Users`,
        progress: referralProgress,
        icon: 'people-outline',
        accent: '#C5FF57',
        gradient: ['rgba(27, 39, 12, 0.96)', 'rgba(9, 12, 8, 0.98)'],
        footer: '',
      },
    ],
    [
      miningData?.totalEarned,
      miningProgress,
      referralCount,
      referralProgress,
      rewardProgress,
      totalCollected,
    ],
  );

  const headerHeight = Math.max(insets.top, 10) + 100;
  const topPadding = headerHeight + FIXED_GRAPH_HEIGHT;
  const bottomPadding = insets.bottom + 100;

  const handleRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await Promise.all([
        refreshMiningStatus(),
        refreshMiningWalletData(false),
        refreshRewardsData(false),
        refreshReferralData(false),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [
    refreshMiningStatus,
    refreshMiningWalletData,
    refreshReferralData,
    refreshRewardsData,
    refreshing,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[
          COLORS.backgroundGradientStart,
          COLORS.backgroundGradientMid,
          COLORS.backgroundGradientEnd,
        ]}
        style={styles.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <AppBackButton onPress={() => navigation.goBack()} />

        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>Performance Overview</Text>
          <Text style={styles.headerTitle}>My Progress</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <View
        style={[
          styles.fixedGraphContainer,
          { 
            top: 0, 
            paddingTop: Math.max(insets.top, 10) + 62,
            height: topPadding,
          },
        ]}
      >
        <LinearGradient
          colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientMid]}
          style={styles.absoluteFill}
        />
        <LinearGradient
          colors={[COLORS.backgroundGradientMid, 'transparent']}
          style={styles.bottomFadeMask}
        />
        <DonutChart segments={chartSegments} total={totalValue} />
      </View>

      <RNAnimated.FlatList
        data={cards}
        keyExtractor={item => item.key}
        renderItem={({ item, index }) => (
          <ProgressCard item={item} index={index} scrollY={scrollY} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          paddingHorizontal: SIDE_PADDING,
        }}
        snapToInterval={CARD_FULL_SIZE}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        getItemLayout={(_, index) => ({
          length: CARD_FULL_SIZE,
          offset: CARD_FULL_SIZE * index,
          index,
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

export default MyProgressScreen;
