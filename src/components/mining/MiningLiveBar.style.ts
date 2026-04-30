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
    borderColor: COLORS.green500Alpha15,

    shadowColor: COLORS.green300Alpha90,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,

    overflow: 'hidden',
  },

  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: 'rgba(0, 255, 17, 0.25)',
    borderRadius: 100,
    top: -80,
    left: -40,
  },

  left: {
    flex: 1,
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