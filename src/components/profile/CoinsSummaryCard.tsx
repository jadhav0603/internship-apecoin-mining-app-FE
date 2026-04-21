import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { useMiningWalletData } from '../../hooks/useMiningWalletData';
import { useReferralData } from '../../hooks/useReferralData';
import { useRewardsData } from '../../hooks/useRewardsData';
import {
  PROFILE_THEME,
  formatAmount,
  formatCompactAmount,
} from './profileTheme';

type BreakdownItem = {
  key: 'mining' | 'rewards' | 'referral';
  label: string;
  value: number;
  ratio: number;
  color: string;
  loading: boolean;
};

const CoinsSummaryCard = () => {
  const [barWidth, setBarWidth] = useState(0);
  const miningAnim = useRef(new Animated.Value(0)).current;
  const rewardsAnim = useRef(new Animated.Value(0)).current;
  const referralAnim = useRef(new Animated.Value(0)).current;

  const { miningTotal, loading: miningLoading } = useMiningWalletData();
  const { totalCollected, loading: rewardsLoading } = useRewardsData();
  const { referralEarnings, loading: referralLoading } = useReferralData();

  const breakdown = useMemo<BreakdownItem[]>(() => {
    const total = miningTotal + totalCollected + referralEarnings;

    return [
      {
        key: 'mining',
        label: 'Mining',
        value: miningTotal,
        ratio: total > 0 ? miningTotal / total : 0,
        color: PROFILE_THEME.neonGreen,
        loading: miningLoading,
      },
      {
        key: 'rewards',
        label: 'Rewards',
        value: totalCollected,
        ratio: total > 0 ? totalCollected / total : 0,
        color: PROFILE_THEME.neonTeal,
        loading: rewardsLoading,
      },
      {
        key: 'referral',
        label: 'Referral',
        value: referralEarnings,
        ratio: total > 0 ? referralEarnings / total : 0,
        color: PROFILE_THEME.neonPurple,
        loading: referralLoading,
      },
    ];
  }, [
    miningLoading,
    miningTotal,
    referralEarnings,
    referralLoading,
    rewardsLoading,
    totalCollected,
  ]);

  const totalCoins = useMemo(
    () => breakdown.reduce((sum, item) => sum + item.value, 0),
    [breakdown]
  );
  const isLoading = miningLoading || rewardsLoading || referralLoading;

  useEffect(() => {
    const animation = Animated.stagger(100, [
      Animated.timing(miningAnim, {
        toValue: breakdown[0]?.ratio ?? 0,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(rewardsAnim, {
        toValue: breakdown[1]?.ratio ?? 0,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(referralAnim, {
        toValue: breakdown[2]?.ratio ?? 0,
        duration: 600,
        useNativeDriver: false,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [breakdown, miningAnim, referralAnim, rewardsAnim]);

  const handleBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Total Coins</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color={PROFILE_THEME.neonGreen} style={styles.loader} />
      ) : (
        <Text style={styles.amount}>
          {formatAmount(totalCoins)}
          <Text style={styles.amountUnit}> APE</Text>
        </Text>
      )}

      <View style={styles.progressBarContainer} onLayout={handleBarLayout}>
        <Animated.View
          style={[
            styles.progressSegment,
            styles.segmentLeft,
            {
              backgroundColor: PROFILE_THEME.neonGreen,
              width: Animated.multiply(miningAnim, barWidth),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.progressSegment,
            {
              backgroundColor: PROFILE_THEME.neonTeal,
              width: Animated.multiply(rewardsAnim, barWidth),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.progressSegment,
            styles.segmentRight,
            {
              backgroundColor: PROFILE_THEME.neonPurple,
              width: Animated.multiply(referralAnim, barWidth),
            },
          ]}
        />
      </View>

      <View style={styles.legendRow}>
        {breakdown.map(item => (
          <View key={item.key} style={styles.legendItem}>
            <View style={styles.legendLabelRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
            {item.loading ? (
              <ActivityIndicator size="small" color={PROFILE_THEME.white} style={styles.legendLoader} />
            ) : (
              <Text style={styles.legendValue}>{formatCompactAmount(item.value)}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: PROFILE_THEME.cardBg,
    padding: 20,
    borderWidth: 1,
    borderColor: PROFILE_THEME.menuBorder,
  },
  label: {
    color: PROFILE_THEME.labelText,
    fontSize: 12,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  amount: {
    color: PROFILE_THEME.white,
    fontSize: 34,
    fontFamily: FONTS.black,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  amountUnit: {
    color: PROFILE_THEME.white,
    fontSize: 34,
    fontFamily: FONTS.regular,
    fontWeight: '400',
  },
  loader: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: PROFILE_THEME.progressTrack,
  },
  progressSegment: {
    height: 6,
  },
  segmentLeft: {
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  segmentRight: {
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flex: 1,
  },
  legendLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    color: PROFILE_THEME.labelText,
    fontSize: 12,
    marginLeft: 6,
  },
  legendValue: {
    color: PROFILE_THEME.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    marginTop: 6,
  },
  legendLoader: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
});

export default CoinsSummaryCard;
