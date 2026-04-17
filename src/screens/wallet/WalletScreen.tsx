import React from 'react';
import {
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
import { FONTS } from '../../constants/FONTS';
import PendingPaidTabs from '../../components/wallet/PendingPaidTabs';
import RevenueChart from '../../components/wallet/RevenueChart';
import { THEME, formatAmount } from '../../components/wallet/theme';

const MINING_TOTAL = 8200;
const REWARD_TOTAL = 3150;
const REFERRAL_TOTAL = 1100;
const TOTAL_ASSETS = MINING_TOTAL + REWARD_TOTAL + REFERRAL_TOTAL;

const WalletScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('../../assets/images/stone_bg.webp')}
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
                name="notifications-outline"
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
              <Text style={styles.totalLabel}>Total Assets</Text>
            </View>

            <Text style={styles.totalAmount}>
              {formatAmount(TOTAL_ASSETS)}
              <Text style={styles.apcLabel}> APC</Text>
            </Text>
          </View>

          <RevenueChart
            miningTotal={MINING_TOTAL}
            rewardTotal={REWARD_TOTAL}
            referralTotal={REFERRAL_TOTAL}
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
    color: THEME.white,
    fontSize: 22,
    fontFamily: FONTS.regular,
    fontWeight: '400',
  },
});

export default WalletScreen;
