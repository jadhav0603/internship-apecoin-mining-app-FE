import React from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PendingPaidTabs from '../../components/wallet/PendingPaidTabs';
import RevenueChart from '../../components/wallet/RevenueChart';
import { THEME, formatAmount } from '../../components/wallet/theme';
import { FONTS } from '../../constants/FONTS';
import { useMiningWalletData } from '../../hooks/useMiningWalletData';
import { useReferralData } from '../../hooks/useReferralData';
import { useRewardsData } from '../../hooks/useRewardsData';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';

const WalletScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const { totalCollected, weekData, loading } = useRewardsData();
  const { miningTotal, miningHistory, loading: miningLoading } = useMiningWalletData();
  const {
    referralEarnings,
    weekData: referralWeekData,
    loading: referralLoading,
  } = useReferralData();

  const totalBalance = totalCollected + miningTotal + referralEarnings;
  const isBalanceLoading = loading || miningLoading || referralLoading;

  return (
    <ImageBackground
      source={require('../../assets/images/daily_reward_background.webp')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.overlay} />
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <View style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(100, tabBarHeight + 28) },
          ]}
        >
          <View
            style={[
              styles.headerRow,
              { paddingTop: Math.max(insets.top + 10, 50) },
            ]}
          >
            <Text style={styles.walletTitle}>Wallet</Text>

            <Pressable style={styles.bellButton}>
              <Ionicons
                name="wallet-outline"
                size={22}
                color={THEME.white}
              />
            </Pressable>
          </View>

          <View style={styles.totalSection}>
            <View style={styles.totalLabelRow}>
              <Ionicons
                name="wallet-outline"
                size={16}
                color={THEME.textMuted}
                style={styles.totalLabelIcon}
              />
              <Text style={styles.totalLabel}>Total Balance</Text>
            </View>

            {isBalanceLoading ? (
              <ActivityIndicator
                size="large"
                color={THEME.neonGreen}
                style={styles.loadingIndicator}
              />
            ) : (
              <Text style={styles.totalAmount}>
                {formatAmount(totalBalance)}
                <Text style={styles.apcLabel}> APE</Text>
              </Text>
            )}
          </View>
          <View style={styles.adContainer}>
            <BannerAd
              unitId={AD_UNITS.BANNER_WALLET}
              size={BannerAdSize.BANNER}
            />
          </View>

          <RevenueChart
            weekData={weekData}
            totalCollected={totalCollected}
            miningHistory={miningHistory}
            miningTotal={miningTotal}
            referralWeekData={referralWeekData}
            referralEarnings={referralEarnings}
            loading={loading}
            miningLoading={miningLoading}
            referralLoading={referralLoading}
          />

          <PendingPaidTabs />
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: THEME.overlay,
  },
  topGlow: {
    position: 'absolute',
    top: 80,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(170, 255, 0, 0.08)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 160,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  walletTitle: {
    color: THEME.white,
    fontSize: 28,
    fontFamily: FONTS.black,
    fontWeight: '800',
  },
  bellButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalSection: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  totalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabelIcon: {
    marginRight: 6,
  },
  totalLabel: {
    color: THEME.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  totalAmount: {
    color: THEME.white,
    fontSize: 44,
    fontFamily: FONTS.black,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 1,
  },
  apcLabel: {
    color: THEME.neonGreen,
    fontSize: 22,
    fontFamily: FONTS.regular,
    fontWeight: '400',
  },
  loadingIndicator: {
    marginTop: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  breakdownCard: {
    flex: 1,
    minHeight: 120,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.borderMuted,
    backgroundColor: 'rgba(28, 32, 24, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'center',
  },
  breakdownCardSpacing: {
    marginRight: 12,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabel: {
    marginLeft: 8,
    color: THEME.textMuted,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  breakdownValue: {
    marginTop: 10,
    color: THEME.white,
    fontSize: 28,
    fontFamily: FONTS.black,
    fontWeight: '800',
  },
  breakdownUnit: {
    color: THEME.neonGreen,
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontWeight: '600',
  },
  breakdownLoader: {
    marginTop: 18,
  },
  adContainer: {
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
});

export default WalletScreen;
