import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { THEME } from './theme';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.green950Alpha72,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    backgroundColor: COLORS.green900Alpha98,
    borderWidth: 1,
    borderColor: COLORS.lime500Alpha16,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.whiteAlpha05,
    borderWidth: 1,
    borderColor: COLORS.whiteAlpha08,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginTop: 8,
    marginBottom: 18,
    backgroundColor: THEME.neonGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.neonGreen,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  iconGlow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 38,
    backgroundColor: COLORS.lime500Alpha12,
    transform: [{ scale: 1.18 }],
  },
  title: {
    color: THEME.white,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 10,
    color: THEME.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    fontFamily: FONTS.medium,
  },
});

export default styles;
