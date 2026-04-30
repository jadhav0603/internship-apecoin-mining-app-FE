import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.85;
const CENTER_SIZE = 80;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    alignItems: 'center',
  },
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: WHEEL_SIZE - 20,
    height: WHEEL_SIZE - 20,
    borderRadius: (WHEEL_SIZE - 20) / 2,
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.1)',
    borderStyle: 'dashed',
  },
  innerRing: {
    position: 'absolute',
    width: CENTER_SIZE + 40,
    height: CENTER_SIZE + 40,
    borderRadius: (CENTER_SIZE + 40) / 2,
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.15)',
  },
  multiplierItem: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#A6FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  multiplierText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  activeMultiplierText: {
    color: '#000',
  },
  centerCore: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  centerInner: {
    alignItems: 'center',
  },
  centerLabel: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: FONTS.bold,
    marginTop: 2,
    letterSpacing: 1,
  },
  infoContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontFamily: FONTS.black,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  activateButton: {
    marginTop: 28,
    minWidth: 220,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  activateButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  activateButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  activateButtonText: {
    color: '#081004',
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeButton: {
    marginTop: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default styles;
