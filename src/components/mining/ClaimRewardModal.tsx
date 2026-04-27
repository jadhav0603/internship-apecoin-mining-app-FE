import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Modal, Pressable, Text, View, Animated, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useMining } from '../../context/MiningContext';
import { useWallet } from '../../context/WalletContext';
import { COLORS } from '../../constants/COLORS';
import API from '../../services/api';
import { useRewardedAd } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';
import { useAdLoadingGate } from '../../hooks/useAdLoadingGate';

const ClaimRewardModal = () => {
  const {
    isMining,
    earned,
    secondsLeft,
    hours,
    multiplier,
    stopMining,
    miningData,
    showClaimPopup,
    dismissClaimPopup,
  } = useMining();
  const { setBalanceFromServer } = useWallet();
  const [visible, setVisible] = useState(true);
  const [isPendingReward, setIsPendingReward] = useState(false);
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
    (miningData?.canClaim ?? false) &&
    (miningData?.status === 'idle' || miningData?.status === 'mining');

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
    startAd({
      onAdShown: () => setIsPendingReward(true),
    });
  };

  const executeClaim = useCallback(async () => {
    try {
      const response = await API.post('/mining/claim');
      setBalanceFromServer(response.data?.balance ?? 0);
      setVisible(false);

      setTimeout(() => {
        stopMining().catch(error => {
          console.error('[mining] failed to stop after claim:', error);
        });
        dismissClaimPopup();
      }, 300);
    } catch (err) {
      console.error('[mining] claim failed:', err);
    }
  }, [dismissClaimPopup, setBalanceFromServer, stopMining]);

  useEffect(() => {
    if (isClosed && isPendingReward) {
      setIsPendingReward(false);
      if (isEarnedReward) {
        executeClaim();
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
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
        <View
          style={{
            width: 300,
            borderRadius: 26,
            overflow: 'hidden',
            padding: 2, // border thickness
            backgroundColor: '#0a1a0a',
          }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: '150%',
                height: '150%',
                top: '-25%',
                left: '-25%',
              },
              { transform: [{ rotate: spin }] },
            ]}
          >
            <LinearGradient
              colors={['#39FF14', '#0a1a0a', '#14ff37ff', '#0a1a0a']}
              locations={[0, 0.25, 0.5, 0.75]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          <View
            style={{
              backgroundColor: COLORS.backgroundLight,
              borderRadius: 24,
              padding: 20,
            }}
          >
            <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Mining Complete
          </Text>

          <Text
            style={{
              color: COLORS.primary,
              fontSize: 22,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            {earned.toFixed(6)} APC
          </Text>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: COLORS.textSecondary }}>Duration: {hours}h</Text>
            <Text style={{ color: COLORS.textSecondary }}>Multiplier: {multiplier}x</Text>
            <Text style={{ color: COLORS.textSecondary }}>
              Remaining: {formatTime(secondsLeft)}
            </Text>
          </View>

          <Pressable
            onPress={handleClaim}
            style={{
              marginTop: 20,
              backgroundColor: COLORS.primary,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: COLORS.textDark,
                fontWeight: 'bold',
              }}
            >
              CLAIM REWARD
            </Text>
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
