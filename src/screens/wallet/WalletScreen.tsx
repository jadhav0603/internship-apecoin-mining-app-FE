import React, { useEffect, useRef, useState } from 'react';
import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from '@react-navigation/native';
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import PendingPaidTabs from '../../components/wallet/PendingPaidTabs';
import WithdrawDetailsSheet from '../../components/wallet/WithdrawDetailsSheet';
import RevenueChart from '../../components/wallet/RevenueChart';
import type { WalletTransaction } from '../../components/wallet/TransactionItem';
import WithdrawSuccessModal from '../../components/wallet/WithdrawSuccessModal';
import { THEME, formatAmount } from '../../components/wallet/theme';
import { FONTS } from '../../constants/FONTS';
import { useLiquidBalance } from '../../hooks/useLiquidBalance';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';
import type { RootStackParamList } from '../../navigation/types';
import { useUser } from '../../context/UserContext';
import { useAlert } from '../../context/AlertContext';
import {
  withdrawService,
  type WithdrawRecord,
} from '../../services/withdrawService';
import useBottomOverlayPadding from '../../hooks/useBottomOverlayPadding';

const WalletScreen = () => {
  const insets = useSafeAreaInsets();
  const bottomContentPadding = useBottomOverlayPadding(132);
  const navigation =
    useNavigation<NavigationProp<RootStackParamList & ParamListBase>>();
  const { user } = useUser();
  const { showError } = useAlert();
  const ctaFloat = useRef(new Animated.Value(0)).current;
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] =
    useState(false);
  const [selectedWithdrawRecord, setSelectedWithdrawRecord] =
    useState<WalletTransaction | null>(null);
  const {
    totalCollected,
    weekData,
    miningTotal,
    miningHistory,
    referralEarnings,
    referralWeekData,
    pendingRecords,
    paidRecords,
    liquidBalance,
    loading: isBalanceLoading,
    withdrawLoading: withdrawDataLoading,
    error: withdrawDataError,
    refreshWithdrawRecords,
  } = useLiquidBalance();
  const displayBalance = liquidBalance;
  const isWithdrawDisabled = withdrawLoading || displayBalance <= 0;
  const walletReady = !isBalanceLoading;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(ctaFloat, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(ctaFloat, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [ctaFloat]);

  const mapWithdrawRecordToTransaction = (
    item: WithdrawRecord,
  ): WalletTransaction => ({
    id: item._id || item.id || `${item.userId}-${item.withdrawalDate}`,
    type: 'Withdraw Request',
    amount: `${formatAmount(item.amount)} APE`,
    amountValue: item.amount,
    date: new Date(item.withdrawalDate).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    status: item.status,
    miningEarnings: item.miningEarnings ?? 0,
    referralEarnings: item.referralEarnings ?? 0,
    dailyRewards: item.dailyRewards ?? 0,
  });

  const pendingWithdrawItems = pendingRecords.map(
    mapWithdrawRecordToTransaction,
  );
  const paidWithdrawItems = paidRecords.map(mapWithdrawRecordToTransaction);
  const balancePulseStyle = {
    transform: [
      {
        translateY: ctaFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  };

  const handleWithdrawPress = async () => {
    if (isWithdrawDisabled) {
      return;
    }

    if (!user?.uid || !user?.email) {
      showError(
        'User details are missing for this withdrawal request.',
        'Unable to continue',
      );
      return;
    }

    try {
      setWithdrawLoading(true);

      await withdrawService.requestWithdraw({
        userId: user.uid,
        email: user.email,
        amount: displayBalance,
      });

      await refreshWithdrawRecords();
      setShowWithdrawSuccessModal(true);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Failed to submit withdrawal request.';

      showError(message, 'Request Failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/daily_reward_background.webp')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.overlay} />
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <View style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomContentPadding },
          ]}
        >
          <View
            style={[
              styles.headerRow,
              { paddingTop: Math.max(insets.top + 10, 50) },
            ]}
          >
            <Text style={styles.walletTitle}>Wallet</Text>

            <Pressable
              style={styles.bellButton}
              onPress={() => navigation.navigate('TransactionHistory')}
            >
              <Ionicons name="receipt-outline" size={22} color={THEME.white} />
            </Pressable>
          </View>

          <View style={styles.adContainer}>
            <BannerAd
              unitId={AD_UNITS.BANNER_WALLET}
              size={BannerAdSize.BANNER}
            />
          </View>

          <LinearGradient
            colors={['rgba(20, 28, 16, 0.96)', 'rgba(8, 17, 11, 0.92)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroGlowPrimary} />
            <View style={styles.heroGlowSecondary} />

            <View style={styles.heroTopRow}>
              <View style={styles.totalLabelRow}>
                <View style={styles.totalLabelBadge}>
                  <Ionicons
                    name="wallet-outline"
                    size={16}
                    color={THEME.neonGreen}
                    style={styles.totalLabelIcon}
                  />
                  <Text style={styles.totalLabel}>Liquid Wallet</Text>
                </View>
              </View>

              <View style={styles.heroMetaPill}>
                <Ionicons
                  name="sparkles-outline"
                  size={14}
                  color={THEME.neonGreen}
                />
                <Text style={styles.heroMetaText}>Premium Yield</Text>
              </View>
            </View>

            <View style={styles.totalSection}>
              {walletReady ? (
                <>
                  <Text style={styles.totalAmount}>
                    {formatAmount(displayBalance)}
                    <Text style={styles.apcLabel}> APE</Text>
                  </Text>
                  <Text style={styles.heroCaption}>
                    Withdrawable balance available now
                  </Text>
                </>
              ) : (
                <View style={styles.balanceSkeletonWrap}>
                  <View style={styles.balanceSkeletonBadge} />
                  <View style={styles.balanceSkeletonAmount} />
                  <View style={styles.balanceSkeletonCaption} />
                </View>
              )}
            </View>

            <View style={styles.heroInsightsRow}>
              <View style={[styles.insightCard, styles.insightCardSpacing]}>
                <Text style={styles.insightLabel}>Mining</Text>
                {isBalanceLoading ? (
                  <View style={styles.insightSkeletonLine} />
                ) : (
                  <Text style={styles.insightValue}>
                    {formatAmount(miningTotal)}{' '}
                    <Text style={styles.insightUnit}>APE</Text>
                  </Text>
                )}
              </View>

              <View style={[styles.insightCard, styles.insightCardSpacing]}>
                <Text style={styles.insightLabel}>Rewards</Text>
                {isBalanceLoading ? (
                  <View style={styles.insightSkeletonLine} />
                ) : (
                  <Text style={styles.insightValue}>
                    {formatAmount(totalCollected)}{' '}
                    <Text style={styles.insightUnit}>APE</Text>
                  </Text>
                )}
              </View>

              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>Referrals</Text>
                {isBalanceLoading ? (
                  <View style={styles.insightSkeletonLine} />
                ) : (
                  <Text style={styles.insightValue}>
                    {formatAmount(referralEarnings)}{' '}
                    <Text style={styles.insightUnit}>APE</Text>
                  </Text>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* <View style={styles.sectionBlock}>
            <RevenueChart
              weekData={weekData}
              totalCollected={totalCollected}
              miningHistory={miningHistory}
              miningTotal={miningTotal}
              referralWeekData={referralWeekData}
              referralEarnings={referralEarnings}
              loading={isBalanceLoading}
              miningLoading={isBalanceLoading}
              referralLoading={isBalanceLoading}
            />
          </View> */}

          <View style={styles.sectionBlock}>
            <PendingPaidTabs
              pendingItems={pendingWithdrawItems}
              paidItems={paidWithdrawItems}
              loading={withdrawDataLoading}
              error={withdrawDataError}
              onRecordPress={setSelectedWithdrawRecord}
            />
          </View>
        </ScrollView>

        <Animated.View
          style={[
            styles.stickyCtaWrap,
            balancePulseStyle,
            { bottom: Math.max(bottomContentPadding - 92, insets.bottom + 24) },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.withdrawButton,
              pressed && styles.withdrawButtonPressed,
              isWithdrawDisabled && styles.withdrawButtonDisabled,
            ]}
            onPress={handleWithdrawPress}
            disabled={isWithdrawDisabled}
          >
            <LinearGradient
              colors={['#EBFF9A', THEME.neonGreen, '#8FD312']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.withdrawButtonGradient}
            >
              {withdrawLoading ? (
                <ActivityIndicator size="small" color={THEME.bg} />
              ) : (
                <>
                  <View>
                    <Text style={styles.withdrawButtonEyebrow}>
                      Ready to move funds?
                    </Text>
                    <Text style={styles.withdrawButtonText}>
                      Withdraw to your account
                    </Text>
                  </View>
                  <View style={styles.withdrawButtonIconWrap}>
                    <Ionicons name="arrow-forward" size={18} color={THEME.bg} />
                  </View>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      <WithdrawSuccessModal
        visible={showWithdrawSuccessModal}
        onClose={() => setShowWithdrawSuccessModal(false)}
      />
      <WithdrawDetailsSheet
        visible={selectedWithdrawRecord !== null}
        record={selectedWithdrawRecord}
        onClose={() => setSelectedWithdrawRecord(null)}
      />
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
    fontSize: 30,
    fontFamily: FONTS.black,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  bellButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.neonGreen,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  heroCard: {
    marginTop: 10,
    marginHorizontal: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(198, 255, 117, 0.18)',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    backgroundColor: 'rgba(17, 23, 16, 0.9)',
    shadowColor: THEME.neonGreen,
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 16,
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -40,
    right: -10,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(170, 255, 0, 0.14)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -32,
    left: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(4, 92, 77, 0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalSection: {
    marginTop: 18,
    minHeight: 104,
    justifyContent: 'center',
  },
  totalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  totalLabelIcon: {
    marginRight: 6,
  },
  totalLabel: {
    color: THEME.white,
    fontSize: 13,
    fontFamily: FONTS.medium,
    letterSpacing: 0.3,
  },
  heroMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(170, 255, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(170, 255, 0, 0.18)',
  },
  heroMetaText: {
    color: THEME.neonGreen,
    fontSize: 12,
    fontFamily: FONTS.medium,
    fontWeight: '600',
  },
  totalAmount: {
    color: THEME.white,
    fontSize: 46,
    fontFamily: FONTS.black,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  apcLabel: {
    color: THEME.neonGreen,
    fontSize: 20,
    fontFamily: FONTS.regular,
    fontWeight: '400',
  },
  heroCaption: {
    marginTop: 10,
    color: THEME.textMuted,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  loadingIndicator: {
    marginTop: 8,
  },
  balanceSkeletonWrap: {
    gap: 12,
  },
  balanceSkeletonBadge: {
    width: 116,
    height: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  balanceSkeletonAmount: {
    width: '82%',
    height: 48,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  balanceSkeletonCaption: {
    width: '58%',
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroInsightsRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  insightCard: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  insightCardSpacing: {
    marginRight: 10,
  },
  insightLabel: {
    color: THEME.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: 8,
  },
  insightValue: {
    color: THEME.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    lineHeight: 22,
  },
  insightUnit: {
    color: THEME.neonGreen,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  insightSkeletonLine: {
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 4,
  },
  sectionBlock: {
    marginTop: 2,
  },
  adContainer: {
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  stickyCtaWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
  },
  withdrawButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: THEME.neonGreen,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  withdrawButtonGradient: {
    minHeight: 72,
    paddingHorizontal: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  withdrawButtonDisabled: {
    opacity: 0.55,
  },
  withdrawButtonPressed: {
    opacity: 0.92,
  },
  withdrawButtonEyebrow: {
    color: 'rgba(7, 12, 6, 0.72)',
    fontSize: 11,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  withdrawButtonText: {
    color: THEME.bg,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  withdrawButtonIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WalletScreen;
