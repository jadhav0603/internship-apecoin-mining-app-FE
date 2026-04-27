import { useMemo } from 'react';
import { useMiningWalletData } from './useMiningWalletData';
import { useReferralData } from './useReferralData';
import { useRewardsData } from './useRewardsData';
import { useWithdrawData } from './useWithdrawData';
import { useMining } from '../context/MiningContext';

export const useLiquidBalance = () => {
  const { hasUnclaimedReward, earned } = useMining();
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

  const pendingUnclaimedMiningReward = hasUnclaimedReward ? earned : 0;
  const settledMiningTotal = Math.max(0, miningTotal - pendingUnclaimedMiningReward);
  const totalEarnedBalance = totalCollected + settledMiningTotal + referralEarnings;
  const pendingWithdrawAmount = useMemo(
    () => pendingRecords.reduce((sum, item) => sum + (item.amount ?? 0), 0),
    [pendingRecords],
  );
  const liquidBalance = Math.max(0, totalEarnedBalance - pendingWithdrawAmount);

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
    pendingWithdrawAmount,
    liquidBalance,
    loading: rewardsLoading || miningLoading || referralLoading,
    withdrawLoading,
    error: rewardsError || miningError || referralError || withdrawError,
    refreshWithdrawRecords,
  };
};

export default useLiquidBalance;
