import React, { useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { useMining } from '../../context/MiningContext';
import { useWallet } from '../../context/WalletContext';
import { COLORS } from '../../constants/COLORS';

const ClaimRewardModal = () => {
  const { isMining, earned, secondsLeft, hours, multiplier, stopMining } = useMining();
  const { addToWallet } = useWallet();

  const [visible, setVisible] = useState(true);

  // ❌ show only when mining completed
  if (isMining || !visible) return null;

  const handleClaim = () => {
    addToWallet(earned);   // 💰 add balance
    setVisible(false);     // ❌ close modal
    setTimeout(() => {
      stopMining();        // 🔥 reset mining AFTER close
    }, 300);
  };

  const formatTime = (sec:number)=>{
    const h = Math.floor(sec/3600);
    const m = Math.floor((sec%3600)/60);
    const s = sec%60;
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
          {/* 🎉 Title */}
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: 18,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Mining Complete 🎉
          </Text>

          {/* 💰 Earned */}
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

          {/* 📊 Details */}
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: COLORS.textSecondary }}>
              Duration: {hours}h
            </Text>
            <Text style={{ color: COLORS.textSecondary }}>
              Multiplier: {multiplier}x
            </Text>
            <Text style={{ color: COLORS.textSecondary }}>
              Remaining: {formatTime(secondsLeft)}
            </Text>
          </View>

          {/* 🚀 CLAIM BUTTON */}
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