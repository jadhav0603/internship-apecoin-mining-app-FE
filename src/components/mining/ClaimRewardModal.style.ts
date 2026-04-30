import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 300,
    borderRadius: 26,
    overflow: 'hidden',
    padding: 2,
    backgroundColor: '#0a1a0a',
  },
  rotatingGradient: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    top: '-25%',
    left: '-25%',
  },
  gradientFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 24,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  amount: {
    color: COLORS.primary,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  detailsGroup: {
    marginTop: 10,
  },
  detailText: {
    color: COLORS.textSecondary,
  },
  claimButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  claimButtonText: {
    color: COLORS.textDark,
    fontWeight: 'bold',
  },
});

export default styles;
