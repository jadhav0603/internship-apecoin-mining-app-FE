import { StyleSheet } from 'react-native';
import { FONTS } from '../../constants/FONTS';
import { COLORS } from '../../constants/COLORS';

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    marginHorizontal: 6,
  },
  container: {
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.green950Tone3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 1.5, // Border width
    // Glow effect
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
  },
  borderWrapper: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,
    overflow: 'hidden',
  },
  borderBeam: {
    position: 'absolute',
    width: '300%',
    height: '300%',
    top: '-100%',
    left: '-100%',
  },
  full: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  label: {
    color: COLORS.neutral100,
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    flexShrink: 1,
  },
});

export default styles;
