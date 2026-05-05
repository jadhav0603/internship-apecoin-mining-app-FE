import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    minHeight: 62,
    backgroundColor: COLORS.neutral900Tone2,
    paddingBottom: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.black,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  gradient: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: COLORS.black,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },

  progressTrack: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(34, 245, 108, 0.14)',
  },

  progressGradient: {
    ...StyleSheet.absoluteFill,
  },

  shimmerWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
  },

  shimmer: {
    flex: 1,
    transform: [{ skewX: '-18deg' }],
  },

  left: {
    flex: 1,
    zIndex: 1,
  },

  label: {
    color: '#00E5FF',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },

  value: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },

  button: {
    borderRadius: 999,
    overflow: 'hidden',
    zIndex: 1,
  },

  buttonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },

  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.85,
  },

  buttonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
});

export const getContainerStyle = (bottom: number) => [
  styles.container,
  { bottom },
];

export default styles;
