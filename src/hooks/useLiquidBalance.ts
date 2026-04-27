import { useMemo } from 'react';
import { useMiningWalletData } from './useMiningWalletData';
import { useReferralData } from './useReferralData';
import { useRewardsData } from './useRewardsData';
import { useWithdrawData } from './useWithdrawData';
import { useMining } from '../context/MiningContext';
import { useWallet } from '../context/WalletContext';

export const useLiquidBalance = () => {
  const { isMining, hasUnclaimedReward, earned, claimRewardAmount } = useMining();
  const { balance } = useWallet();
  const {
    totalCollected,
    weekData,
    loading: rewardsLoading,
    error: rewardsError,
  } = useRewardsData();
  const {
    miningTotal,
    miningHistory,
    loading: miningLoading,
    error: miningError,
  } = useMiningWalletData();
  const {
    referralEarnings,
    weekData: referralWeekData,
    loading: referralLoading,
    error: referralError,
  } = useReferralData();
  const {
    pendingRecords,
    paidRecords,
    loading: withdrawLoading,
    error: withdrawError,
    refreshWithdrawRecords,
  } = useWithdrawData();

  const unsettledMiningReward = isMining
    ? earned
    : hasUnclaimedReward
      ? claimRewardAmount || earned
      : 0;
  const settledMiningTotal = Math.max(0, miningTotal - unsettledMiningReward);
  const totalEarnedBalance = totalCollected + settledMiningTotal + referralEarnings;
  const withdrawnAmount = useMemo(
    () =>
      [...pendingRecords, ...paidRecords].reduce(
        (sum, item) => sum + (item.amount ?? 0),
        0,
      ),
    [paidRecords, pendingRecords],
  );
  const liquidBalance = Math.max(0, balance);

  return {
    totalCollected,
    weekData,
    miningTotal: settledMiningTotal,
    miningHistory,
    referralEarnings,
    referralWeekData,
    pendingRecords,
    paidRecords,
    totalEarnedBalance,
    pendingWithdrawAmount: withdrawnAmount,
    liquidBalance,
    loading: rewardsLoading || miningLoading || referralLoading,
    withdrawLoading,
    error: rewardsError || miningError || referralError || withdrawError,
    refreshWithdrawRecords,
  };
};

export default useLiquidBalance;
