import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useMining } from '../../context/MiningContext';
import { useWallet } from '../../context/WalletContext';
import { COLORS } from '../../constants/COLORS';
import API from '../../services/api';

const ClaimRewardModal = () => {
  const { isMining, earned, secondsLeft, hours, multiplier, stopMining, miningData } = useMining();
  const { setBalanceFromServer } = useWallet();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (isMining) {
      setVisible(true);
    }
  }, [isMining]);

  const isClaimAvailable = miningData?.status === 'idle' && earned > 0;

  if (isMining || !visible || !isClaimAvailable) {
    return null;
  }

  const handleClaim = async () => {
    const response = await API.post('/mining/claim');
    setBalanceFromServer(response.data?.balance ?? 0);
    setVisible(false);

    setTimeout(() => {
      void stopMining();
    }, 300);
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
