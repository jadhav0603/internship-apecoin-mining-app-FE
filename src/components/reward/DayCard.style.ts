import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inner: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  dayText: {
    position: 'absolute',
    top: 14,
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
    bottom: 26,
    fontSize: 12,
    fontWeight: '500',
    color: '#eaaf0f',
    textAlign: 'center',
    width: '100%',
  },

  glowCard: {
    // Glow removed per user request
  },

  claimedOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },

  claimedText: {
    fontSize: 26,
    color: '#39FF14',
    fontWeight: 'bold',
  },
});

export default styles;
