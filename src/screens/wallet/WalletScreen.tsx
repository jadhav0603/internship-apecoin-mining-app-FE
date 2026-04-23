import React, { useState } from 'react';
import {
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
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
import {
  withdrawService,
  type WithdrawRecord,
} from '../../services/withdrawService';

const WalletScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NavigationProp<RootStackParamList & ParamListBase>>();
  const { user } = useUser();
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

  const pendingWithdrawItems = pendingRecords.map(mapWithdrawRecordToTransaction);
  const paidWithdrawItems = paidRecords.map(mapWithdrawRecordToTransaction);

  const handleWithdrawPress = async () => {
    if (isWithdrawDisabled) {
      return;
    }

    if (!user?.uid || !user?.email) {
      Alert.alert(
        'Unable to continue',
        'User details are missing for this withdrawal request.',
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

      Alert.alert('Request Failed', message);
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
                {formatAmount(displayBalance)}
                <Text style={styles.apcLabel}> APE</Text>
              </Text>
            )}
          </View>

          <Pressable
            style={[
              styles.withdrawButton,
              isWithdrawDisabled && styles.withdrawButtonDisabled,
            ]}
            onPress={handleWithdrawPress}
            disabled={isWithdrawDisabled}
          >
            {withdrawLoading ? (
              <ActivityIndicator size="small" color={THEME.bg} />
            ) : (
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            )}
          </Pressable>

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

          <PendingPaidTabs
            pendingItems={pendingWithdrawItems}
            paidItems={paidWithdrawItems}
            loading={withdrawDataLoading}
            error={withdrawDataError}
            onRecordPress={setSelectedWithdrawRecord}
          />
        </ScrollView>
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
  withdrawButton: {
    marginTop: 12,
    marginHorizontal: 20,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: THEME.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawButtonDisabled: {
    opacity: 0.7,
  },
  withdrawButtonText: {
    color: THEME.bg,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
});

export default WalletScreen;
