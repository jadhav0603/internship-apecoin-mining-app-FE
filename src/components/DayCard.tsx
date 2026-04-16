import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 40) / 3;

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
    ? require('../assets/images/card_bg_active.png')
    : require('../assets/images/card_bg_locked.png');

  return (
    <TouchableOpacity
      onPress={isClaimable ? onPress : undefined}
      activeOpacity={0.85}
      style={[styles.container, isClaimable && styles.glowCard]}
    >
      {/* Background */}
      <Image source={bgImage} style={styles.bg} resizeMode="stretch" />

      {/* DAY */}
      <Text style={styles.dayText}>{`DAY ${day}`}</Text>

      {/* COIN / LOCK */}
      {isLocked ? (
        <Image
          source={require('../assets/images/lock_icon.png')}
          style={styles.lockCoin}
          resizeMode="contain"
        />
      ) : (
        <Image
          source={require('../assets/images/coin_stack.png')}
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
    </TouchableOpacity>
  );
};

export default DayCard;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 150,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  dayText: {
    position: 'absolute',
    top: 16,
    fontSize: 13,
    fontWeight: '900',
    color: '#e6d159',
    letterSpacing: 1,
    textAlign: 'center',
    width: '100%',
  },

  // 🪙 Coin
  coin: {
    position: 'absolute',
    top: '35%',
    width: 85,
    height: 70,
    transform: [
      { translateY: -24 },
      { scale: 1.05 },
    ],
  },

  // 🔒 Lock (centered like coin but smaller)
  lockCoin: {
    position: 'absolute',
    top: '40%',
    width: 60,
    height: 50,
    transform: [{ translateY: -14 }],
  },

  amount: {
    position: 'absolute',
    bottom: 30,
    fontSize: 14,
    fontWeight: 'medium',
    color: '#eaaf0f',
    textAlign: 'center',
    width: '100%',
  },

  glowCard: {
    shadowColor: '#b1ff14',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 45,
  },

  claimedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  claimedText: {
    fontSize: 26,
    color: '#39FF14',
    fontWeight: 'bold',
  },
});