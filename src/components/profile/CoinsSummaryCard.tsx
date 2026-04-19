import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import {
  COIN_BREAKDOWN,
  PROFILE_THEME,
  TOTAL_COINS,
  formatAmount,
  formatCompactAmount,
} from './profileTheme';

const CoinsSummaryCard = () => {
  const [barWidth, setBarWidth] = useState(0);
  const miningAnim = useRef(new Animated.Value(0)).current;
  const rewardsAnim = useRef(new Animated.Value(0)).current;
  const referralAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.stagger(100, [
      Animated.timing(miningAnim, {
        toValue: COIN_BREAKDOWN[0].ratio,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(rewardsAnim, {
        toValue: COIN_BREAKDOWN[1].ratio,
        duration: 600,
        useNativeDriver: false,
      }),
      Animated.timing(referralAnim, {
        toValue: COIN_BREAKDOWN[2].ratio,
        duration: 600,
        useNativeDriver: false,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [miningAnim, referralAnim, rewardsAnim]);

  const handleBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Total Coins</Text>
      <Text style={styles.amount}>
        {formatAmount(TOTAL_COINS)}
        <Text style={styles.amountUnit}> APC</Text>
      </Text>

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
        {COIN_BREAKDOWN.map(item => (
          <View key={item.key} style={styles.legendItem}>
            <View style={styles.legendLabelRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
            <Text style={styles.legendValue}>{formatCompactAmount(item.value)}</Text>
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
});

export default CoinsSummaryCard;
