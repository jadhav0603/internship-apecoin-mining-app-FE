import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Modal, Pressable, Text, View, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useMining } from '../../context/MiningContext';
import { useWallet } from '../../context/WalletContext';
import { COLORS } from '../../constants/COLORS';
import API from '../../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useInterstitialAd } from 'react-native-google-mobile-ads';
// import { AD_UNITS } from '../../constants/AD_UNITS';
import { useRewardedAd } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';
import { useAdLoadingGate } from '../../hooks/useAdLoadingGate';
import Loading from '../constant/Loading';
import styles from './ClaimRewardModal.style';

const ClaimRewardModal = () => {
  const {
    isMining,
    earned,
    claimRewardAmount,
    secondsLeft,
    hours,
    multiplier,
    stopMining,
    miningData,
    showClaimPopup,
    hasUnclaimedReward,
    dismissClaimPopup,
  } = useMining();
  const { refreshBalance, setBalanceFromServer } = useWallet();
  const [visible, setVisible] = useState(true);
  const [isPendingReward, setIsPendingReward] = useState(false);
  const [isClaimActionBusy, setIsClaimActionBusy] = useState(false);
  const { isLoaded, isClosed, load, show, isEarnedReward } = useRewardedAd(
    AD_UNITS.REWARDED_CLAIM,
    { requestNonPersonalizedAdsOnly: true }
  );
  const { startAd, adLoadingModal } = useAdLoadingGate({ isLoaded, load, show });

  useEffect(() => {
    if (isMining) {
      setVisible(true);
    }
  }, [isMining]);

  const isClaimAvailable =
    showClaimPopup &&
    hasUnclaimedReward &&
    miningData?.status !== 'claimed' &&
    Boolean(miningData?.miningStartTime);

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleClaim = () => {
    if (isClaimActionBusy) {
      return;
    }

    setIsClaimActionBusy(true);
    startAd({
      onAdShown: () => setIsPendingReward(true),
    });
  };

  const executeClaim = useCallback(async () => {
    try {
      const response = await API.post('/mining/claim');
      const nextWalletBalance = response.data?.walletBalance ?? response.data?.balance;

      if (Number.isFinite(nextWalletBalance)) {
        setBalanceFromServer(nextWalletBalance);
      } else {
        await refreshBalance();
      }

      setTimeout(() => {
        stopMining().catch(error => {
          console.error('[mining] failed to stop after claim:', error);
        });
        dismissClaimPopup();
      }, 300);
    } catch (err) {
      console.error('[mining] claim failed:', err);
      setIsClaimActionBusy(false);
    }
  }, [dismissClaimPopup, refreshBalance, setBalanceFromServer, stopMining]);

  useEffect(() => {
    if (isClosed && isPendingReward) {
      setIsPendingReward(false);
      if (isEarnedReward) {
        executeClaim();
      } else {
        setIsClaimActionBusy(false);
      }
    }
  }, [executeClaim, isClosed, isEarnedReward, isPendingReward]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');

    return `${hrs}:${mins}:${secs}`;
  };

  if (isMining || !visible || !isClaimAvailable) {
    return null;
  }

  return (
    <>
      <Modal transparent animationType="fade">
        <View style={styles.overlay}>
        <View style={styles.frame}>
          <Animated.View
            style={[
              styles.rotatingGradient,
              { transform: [{ rotate: spin }] },
            ]}
          >
            <LinearGradient
              colors={['#39FF14', '#0a1a0a', '#14ff37ff', '#0a1a0a']}
              locations={[0, 0.25, 0.5, 0.75]}
              style={styles.gradientFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          <View style={styles.card}>
            <Pressable
              onPress={isClaimActionBusy ? undefined : dismissClaimPopup}
              disabled={isClaimActionBusy}
              hitSlop={10}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </Pressable>

            <Text style={styles.title}>Mining Complete</Text>

            <Text style={styles.amount}>
              {(claimRewardAmount || earned).toFixed(6)} APC
            </Text>

            <View style={styles.detailsGroup}>
              <Text style={styles.detailText}>Duration: {hours}h</Text>
              <Text style={styles.detailText}>Multiplier: {multiplier}x</Text>
              <Text style={styles.detailText}>
                Remaining: {formatTime(secondsLeft)}
              </Text>
            </View>

            <Pressable
              onPress={handleClaim}
              disabled={isClaimActionBusy}
              style={[
                styles.claimButton,
                isClaimActionBusy ? styles.claimButtonDisabled : null,
              ]}
            >
              {isClaimActionBusy ? (
                <Loading size={34} text={null} />
              ) : (
                <Text style={styles.claimButtonText}>CLAIM REWARD</Text>
              )}
            </Pressable>
          </View>
        </View>
        </View>
      </Modal>
      {adLoadingModal}
    </>
  );
};

export default ClaimRewardModal;
