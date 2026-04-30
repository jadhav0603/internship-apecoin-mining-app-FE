import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.85;
const CENTER_SIZE = 80;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.blackAlpha85,
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
    borderColor: COLORS.lime500Alpha10,
    borderStyle: 'dashed',
  },
  innerRing: {
    position: 'absolute',
    width: CENTER_SIZE + 40,
    height: CENTER_SIZE + 40,
    borderRadius: (CENTER_SIZE + 40) / 2,
    borderWidth: 1,
    borderColor: COLORS.lime500Alpha15,
  },
  multiplierItem: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: COLORS.activeBorder,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  multiplierText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  activeMultiplierText: {
    color: COLORS.black,
  },
  centerCore: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: COLORS.neutral950Tone2,
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
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.black,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.neutral300,
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
    borderColor: COLORS.whiteAlpha18,
  },
  activateButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  activateButtonDisabled: {
    backgroundColor: COLORS.whiteAlpha12,
    borderColor: COLORS.whiteAlpha08,
  },
  activateButtonText: {
    color: COLORS.green950Tone4,
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
    backgroundColor: COLORS.whiteAlpha10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha20,
  },
});

export default styles;
