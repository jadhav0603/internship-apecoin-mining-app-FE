import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Text, View } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { useMiningWalletData } from '../../hooks/useMiningWalletData';
import { useReferralData } from '../../hooks/useReferralData';
import { useRewardsData } from '../../hooks/useRewardsData';
import Loading from '../constant/Loading';
import {
  PROFILE_THEME,
  formatAmount,
  formatCompactAmount,
} from './profileTheme';
import styles from './CoinsSummaryCard.style';


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
        <Loading size="small" text={null} style={styles.loader} />
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
              <Loading size="small" text={null} style={styles.legendLoader} />
            ) : (
              <Text style={styles.legendValue}>{formatCompactAmount(item.value)}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default CoinsSummaryCard;
