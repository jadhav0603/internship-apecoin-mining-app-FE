import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import styles from './DayCard.style';




interface DayCardProps {
  day: number;
  amount: string;
  state: 'claimable' | 'claimed' | 'locked';
  onPress?: () => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, amount, state, onPress }) => {
  const isClaimable = state === 'claimable';
  const isLocked = state === 'locked';
  const isClaimed = state === 'claimed';

  const bgImage = isClaimable
    ? require('../../assets/images/card_bg_active.webp')
    : require('../../assets/images/card_bg_locked.webp');

  return (
    <TouchableOpacity
      onPress={isClaimable ? onPress : undefined}
      activeOpacity={0.85}
      style={[styles.container, isClaimable && styles.glowCard]}
    >
      <View style={styles.inner}>
        {/* Background */}
        <Image source={bgImage} style={styles.bg} resizeMode="stretch" />

        {/* DAY */}
        <Text style={styles.dayText}>{`DAY ${day}`}</Text>

        {/* COIN / LOCK */}
        {isLocked ? (
          <Image
            source={require('../../assets/images/lock_icon.webp')}
            style={styles.lockCoin}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require('../../assets/images/coin_stack.webp')}
            style={styles.coin}
            resizeMode="contain"
          />
        )}

        {/* AMOUNT */}
        <Text style={styles.amount}>{amount}</Text>

        {/* CLAIMED OVERLAY */}
        {isClaimed && (
          <View style={styles.claimedOverlay}>
            <Text style={styles.claimedText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default DayCard;
