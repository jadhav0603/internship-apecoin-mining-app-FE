import React, { useEffect, useRef, useState } from 'react';
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
import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import PendingPaidTabs from '../../components/wallet/PendingPaidTabs';
import WithdrawDetailsSheet from '../../components/wallet/WithdrawDetailsSheet';
import type { WalletTransaction } from '../../components/wallet/TransactionItem';
import WithdrawSuccessModal from '../../components/wallet/WithdrawSuccessModal';
import { THEME, formatAmount } from '../../components/wallet/theme';
import { FONTS } from '../../constants/FONTS';
import { AD_UNITS } from '../../constants/AD_UNITS';
import type { RootStackParamList } from '../../navigation/types';
import { useUser } from '../../context/UserContext';
import { useAlert } from '../../context/AlertContext';
import { useLiquidBalance } from '../../hooks/useLiquidBalance';
import {
  withdrawService,
  type WithdrawRecord,
} from '../../services/withdrawService';
import useBottomOverlayPadding from '../../hooks/useBottomOverlayPadding';

const WalletScreen = () => {
  const bottomContentPadding = useBottomOverlayPadding(44);
  const navigation =
    useNavigation<NavigationProp<RootStackParamList & ParamListBase>>();
  const { user } = useUser();
  const { showError } = useAlert();
  const buttonFloat = useRef(new Animated.Value(0)).current;
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] =
    useState(false);
  const [selectedWithdrawRecord, setSelectedWithdrawRecord] =
    useState<WalletTransaction | null>(null);
  const {
    totalCollected,
    miningTotal,
    referralEarnings,
    pendingRecords,
    paidRecords,
    liquidBalance,
    loading: isBalanceLoading,
    withdrawLoading: withdrawDataLoading,
    error: withdrawDataError,
    refreshWithdrawRecords,
  } = useLiquidBalance();

  const rawBalance = Number.isFinite(liquidBalance) ? liquidBalance : 0;
  const displayBalance = Number(rawBalance.toFixed(2));
  const isWithdrawDisabled = withdrawLoading || displayBalance <= 0;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonFloat, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: true,
        }),
        Animated.timing(buttonFloat, {
          toValue: 0,
          duration: 1700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [buttonFloat]);

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

  const withdrawFloatStyle = {
    transform: [
      {
        translateY: buttonFloat.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -3],
        }),
      },
    ],
  };

  const overviewCards = [
    {
      key: 'mining',
      label: 'Mining',
      value: formatAmount(miningTotal),
      iconFamily: 'material' as const,
      icon: 'pickaxe',
      iconColor: '#9AFB65',
      iconBackground: 'rgba(154, 251, 101, 0.12)',
    },
    {
      key: 'rewards',
      label: 'Rewards',
      value: formatAmount(totalCollected),
      iconFamily: 'ionicon' as const,
      icon: 'gift-outline',
      iconColor: '#C5F96C',
      iconBackground: 'rgba(197, 249, 108, 0.12)',
    },
    {
      key: 'referrals',
      label: 'Referrals',
      value: formatAmount(referralEarnings),
      iconFamily: 'material' as const,
      icon: 'vector-link',
      iconColor: '#79F1C7',
      iconBackground: 'rgba(121, 241, 199, 0.12)',
    },
  ] as const;

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
        amount: rawBalance,
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

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomContentPadding },
          ]}
        >
          <View style={[styles.headerRow, styles.headerRowSafe]}>
            <Text style={styles.walletTitle}>Wallet</Text>

            <Pressable
              style={styles.receiptButton}
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
            colors={['rgba(14, 54, 29, 0.96)', 'rgba(7, 22, 11, 0.96)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.liquidWalletCard}
          >
            <View style={styles.heroGlowPrimary} />
            <View style={styles.heroGlowSecondary} />
            {/* <View style={styles.heroBorderOverlay} /> */}

            <View style={styles.liquidWalletBadge}>
              <Ionicons
                name="wallet-outline"
                size={16}
                color={THEME.neonGreen}
                style={styles.badgeIcon}
              />
              <Text style={styles.liquidWalletBadgeText}>Wallet Balance</Text>
            </View>

            <View style={styles.balanceBlock}>
              {isBalanceLoading ? (
                <View style={styles.balanceSkeletonWrap}>
                  <View style={styles.balanceSkeletonAmount} />
                  <View style={styles.balanceSkeletonCaption} />
                  <View style={styles.balanceSkeletonPill} />
                </View>
              ) : (
                <>
                  <Text style={styles.balanceAmount}>
                    {formatAmount(displayBalance)}
                    <Text style={styles.balanceUnit}> APE</Text>
                  </Text>
                  <Text style={styles.balanceCaption}>
                    Withdrawable balance available now
                  </Text>
                  {/* <View style={styles.pendingPill}>
                    <Text style={styles.pendingPillText}>
                      {pendingCount} {pendingCount === 1 ? 'item' : 'items'} pending
                    </Text>
                  </View> */}
                </>
              )}
            </View>

            <Animated.View
              style={[styles.withdrawActionWrap, withdrawFloatStyle]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.withdrawAction,
                  pressed && styles.withdrawActionPressed,
                  isWithdrawDisabled && styles.withdrawActionDisabled,
                ]}
                onPress={handleWithdrawPress}
                disabled={isWithdrawDisabled}
              >
                <LinearGradient
                  colors={[
                    'rgba(86, 120, 101, 0.92)',
                    'rgba(20, 63, 42, 0.98)',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.withdrawActionGradient}
                >
                  {withdrawLoading ? (
                    <ActivityIndicator size="small" color={THEME.white} />
                  ) : (
                    <>
                      <View style={styles.withdrawActionIconBox}>
                        <Ionicons
                          name="wallet-outline"
                          size={28}
                          color={THEME.neonGreen}
                        />
                      </View>

                      <View style={styles.withdrawActionCopy}>
                        <Text style={styles.withdrawActionTitle}>WITHDRAW</Text>
                        <Text style={styles.withdrawActionSubtitle}>
                          Withdraw to your account
                        </Text>
                      </View>

                      <View style={styles.withdrawActionArt}>
                        <MaterialCommunityIcons
                          name="cash-multiple"
                          size={36}
                          color="#6EF37F"
                        />
                      </View>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </LinearGradient>

          <View style={styles.overviewSection}>
            <Text style={styles.overviewTitle}>TOTAL OVERVIEW</Text>

            <View style={styles.overviewGrid}>
              {overviewCards.map((card, index) => (
                <LinearGradient
                  key={card.key}
                  colors={['rgba(18, 56, 34, 0.95)', 'rgba(8, 24, 13, 0.96)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.overviewCard,
                    index < overviewCards.length - 1 &&
                      styles.overviewCardSpacing,
                  ]}
                >
                  <View
                    style={[
                      styles.overviewIconWrap,
                      { backgroundColor: card.iconBackground },
                    ]}
                  >
                    {card.iconFamily === 'ionicon' ? (
                      <Ionicons
                        name={card.icon}
                        size={24}
                        color={card.iconColor}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name={card.icon}
                        size={24}
                        color={card.iconColor}
                      />
                    )}
                  </View>

                  <Text style={styles.overviewLabel}>{card.label}</Text>

                  {isBalanceLoading ? (
                    <View style={styles.overviewSkeletonLine} />
                  ) : (
                    <Text style={styles.overviewValue}>
                      {card.value} <Text style={styles.overviewUnit}>APE</Text>
                    </Text>
                  )}
                </LinearGradient>
              ))}
            </View>
          </View>

          <View style={styles.withdrawalsSection}>
            <PendingPaidTabs
              pendingItems={pendingWithdrawItems}
              paidItems={paidWithdrawItems}
              loading={withdrawDataLoading}
              error={withdrawDataError}
              onRecordPress={setSelectedWithdrawRecord}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

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
    backgroundColor: 'rgba(3, 8, 4, 0.58)',
  },
  topGlow: {
    position: 'absolute',
    top: 90,
    right: -32,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(83, 255, 149, 0.08)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 160,
    left: -24,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(170, 255, 0, 0.08)',
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
  headerRowSafe: {
    paddingTop: 12,
  },
  walletTitle: {
    color: THEME.white,
    fontSize: 30,
    fontFamily: FONTS.black,
    fontWeight: '800',
  },
  receiptButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adContainer: {
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  liquidWalletCard: {
    marginHorizontal: 18,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(164, 242, 92, 0.64)',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    shadowColor: 'rgba(170,255,0,0.55)',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -36,
    right: -24,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(140, 255, 134, 0.12)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -36,
    left: -28,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(87, 255, 197, 0.07)',
  },
  heroBorderOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(215,255,154,0.12)',
  },
  liquidWalletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(17, 39, 21, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(178, 245, 110, 0.18)',
  },
  badgeIcon: {
    marginRight: 6,
  },
  liquidWalletBadgeText: {
    color: '#B9EC66',
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontWeight: '600',
  },
  balanceBlock: {
    minHeight: 164,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  balanceAmount: {
    color: THEME.white,
    fontSize: 60,
    lineHeight: 74,
    fontFamily: FONTS.black,
    fontWeight: '900',
    textAlign: 'center',
  },
  balanceUnit: {
    color: THEME.neonGreen,
    fontSize: 30,
    fontFamily: FONTS.regular,
  },
  balanceCaption: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 15,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  pendingPill: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(54, 66, 57, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pendingPillText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  balanceSkeletonWrap: {
    alignItems: 'center',
    gap: 12,
  },
  balanceSkeletonAmount: {
    width: 220,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  balanceSkeletonCaption: {
    width: 190,
    height: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  balanceSkeletonPill: {
    width: 126,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  withdrawActionWrap: {
    marginTop: 8,
  },
  withdrawAction: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  withdrawActionPressed: {
    opacity: 0.94,
  },
  withdrawActionDisabled: {
    opacity: 0.6,
  },
  withdrawActionGradient: {
    minHeight: 96,
    paddingHorizontal: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(172, 245, 111, 0.2)',
  },
  withdrawActionIconBox: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: 'rgba(14, 36, 20, 0.64)',
    borderWidth: 1,
    borderColor: 'rgba(170,255,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawActionCopy: {
    flex: 1,
    paddingHorizontal: 14,
  },
  withdrawActionTitle: {
    color: THEME.white,
    fontSize: 20,
    fontFamily: FONTS.black,
    fontWeight: '900',
    letterSpacing: 1,
  },
  withdrawActionSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  withdrawActionArt: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewSection: {
    marginTop: 18,
    paddingHorizontal: 18,
  },
  overviewTitle: {
    color: THEME.white,
    fontSize: 22,
    fontFamily: FONTS.black,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  overviewGrid: {
    flexDirection: 'row',
    marginTop: 14,
  },
  overviewCard: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(165,243,96,0.38)',
    shadowColor: 'rgba(170,255,0,0.24)',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  overviewCardSpacing: {
    marginRight: 10,
  },
  overviewIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  overviewLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  overviewValue: {
    marginTop: 8,
    color: THEME.white,
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    textAlign: 'center',
  },
  overviewUnit: {
    color: THEME.neonGreen,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  overviewSkeletonLine: {
    width: '82%',
    height: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 8,
  },
  withdrawalsSection: {
    marginTop: 20,
    marginBottom: 4,
  },
});

export default WalletScreen;
