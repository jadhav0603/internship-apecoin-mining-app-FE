import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
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
import WithdrawRequestModal from '../../components/wallet/WithdrawRequestModal';
import type { WalletTransaction } from '../../components/wallet/TransactionItem';
import WithdrawSuccessModal from '../../components/wallet/WithdrawSuccessModal';
import Loading from '../../components/constant/Loading';
import { THEME, formatAmount } from '../../components/wallet/theme';
import { AD_UNITS } from '../../constants/AD_UNITS';
import type { RootStackParamList } from '../../navigation/types';
import { useUser } from '../../context/UserContext';
import { useAlert } from '../../context/AlertContext';
import { useWallet } from '../../context/WalletContext';
import { useLiquidBalance } from '../../hooks/useLiquidBalance';
import {
  withdrawService,
  type WithdrawRecord,
} from '../../services/withdrawService';
import useBottomOverlayPadding from '../../hooks/useBottomOverlayPadding';
import styles from './WalletScreen.style';

const WalletScreen = () => {
  const bottomContentPadding = useBottomOverlayPadding(44);
  const navigation =
    useNavigation<NavigationProp<RootStackParamList & ParamListBase>>();
  const { user } = useUser();
  const { showError } = useAlert();
  const { refreshBalance } = useWallet();
  const buttonFloat = useRef(new Animated.Value(0)).current;
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showWithdrawRequestModal, setShowWithdrawRequestModal] =
    useState(false);
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] =
    useState(false);
  const [savedUpiId, setSavedUpiId] = useState('');
  const [submittedWithdrawAmount, setSubmittedWithdrawAmount] = useState(0);
  const [submittedUpiId, setSubmittedUpiId] = useState('');
  const [historyRefreshKey, setHistoryRefreshKey] = useState<number | undefined>(
    undefined,
  );
  const [selectedWithdrawRecord, setSelectedWithdrawRecord] =
    useState<WalletTransaction | null>(null);
  const {
    totalCollected,
    allMiningTotal,
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
  const displayBalance = Number(rawBalance.toFixed(6));
  const totalMiningBalance = Number.isFinite(allMiningTotal) ? allMiningTotal : 0;
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
      label: 'Total Balance',
      value: formatAmount(totalMiningBalance),
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

  const handleWithdrawPress = () => {
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

    setShowWithdrawRequestModal(true);
  };

  const handleWithdrawSubmit = async (upiId: string) => {
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
        upiId,
      });

      setSavedUpiId(upiId);
      setSubmittedUpiId(upiId);
      setSubmittedWithdrawAmount(rawBalance);
      setShowWithdrawRequestModal(false);
      await refreshBalance();
      await refreshWithdrawRecords();
      setHistoryRefreshKey(Date.now());
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
              onPress={() =>
                navigation.navigate('TransactionHistory', {
                  refreshKey: historyRefreshKey ?? Date.now(),
                })
              }
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
                    {Number(displayBalance).toFixed(6)}
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
                    <Loading size="small" text={null} />
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

      <WithdrawRequestModal
        visible={showWithdrawRequestModal}
        amount={rawBalance}
        loading={withdrawLoading}
        initialUpiId={savedUpiId}
        onClose={() => setShowWithdrawRequestModal(false)}
        onSubmit={handleWithdrawSubmit}
      />
      <WithdrawSuccessModal
        visible={showWithdrawSuccessModal}
        onClose={() => setShowWithdrawSuccessModal(false)}
        subtitle={
          submittedUpiId
            ? `Your request for ${formatAmount(submittedWithdrawAmount)} APE to ${submittedUpiId} is now pending review.`
            : 'Your request is successful but still pending'
        }
      />
      <WithdrawDetailsSheet
        visible={selectedWithdrawRecord !== null}
        record={selectedWithdrawRecord}
        onClose={() => setSelectedWithdrawRecord(null)}
      />
    </ImageBackground>
  );
};

export default WalletScreen;
