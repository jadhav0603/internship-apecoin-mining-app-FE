import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useMining } from '../../context/MiningContext';
import { useWallet } from '../../context/WalletContext';
import { COLORS } from '../../constants/COLORS';
import API from '../../services/api';
import { useInterstitialAd } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';

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
  const { isLoaded, isClosed, load, show } = useInterstitialAd(
    AD_UNITS.INTERSTITIAL_CLAIM,
    { requestNonPersonalizedAdsOnly: true }
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isClosed) {
      load();
    }
  }, [isClosed, load]);

  useEffect(() => {
    if (isMining) {
      setVisible(true);
    }
  }, [isMining]);

  const isClaimAvailable =
    showClaimPopup &&
    (miningData?.canClaim ?? false) &&
    (miningData?.status === 'idle' || miningData?.status === 'mining');

  if (isMining || !visible || !isClaimAvailable) {
    return null;
  }

  const handleClaim = async () => {
    try {
      if (isLoaded) {
        show();
      }
      const response = await API.post('/mining/claim');
      setBalanceFromServer(response.data?.balance ?? 0);
      setVisible(false);

      setTimeout(() => {
        void stopMining();
        dismissClaimPopup();
      }, 300);
    } catch (err) {
      console.error('[mining] claim failed:', err);
    }
  };

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
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
            backgroundColor: COLORS.backgroundLight,
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: COLORS.glassBorder,
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
    </Modal>
  );
};

export default ClaimRewardModal;
