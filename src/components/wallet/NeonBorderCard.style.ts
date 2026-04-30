import { StyleSheet } from 'react-native';
import { THEME } from './theme';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: 22,
    shadowColor: THEME.neonGreen,
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  aura: {
    ...StyleSheet.absoluteFill,
    borderRadius: 22,
    backgroundColor: COLORS.lime500Alpha08Tone2,
    shadowColor: THEME.neonGreen,
    shadowOpacity: 1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  clipMask: {
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: COLORS.lime500Alpha08Tone2,
  },
  gradientOrbit: {
    position: 'absolute',
    top: -120,
    right: -120,
    bottom: -120,
    left: -120,
  },
  gradientFill: {
    flex: 1,
  },
  content: {
    margin: 2,
    borderRadius: 20,
    backgroundColor: COLORS.neutral900Tone3,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.lime500Alpha18Tone2,
  },
});

export default styles;
