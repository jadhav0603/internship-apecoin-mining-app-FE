import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/COLORS';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.green950,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  glow: {
    position: 'absolute',
    width: screenWidth * 1.4,
    height: screenWidth * 1.4,
    borderRadius: screenWidth * 0.7,
    alignSelf: 'center',
  },
  lottie: {
    width: screenWidth,
    height: screenHeight * 0.55,
  },
  label: {
    color: COLORS.successNeon,
    fontWeight: '900',
    fontSize: 22,
    marginTop: 10,
    letterSpacing: 1.5,
    textShadowColor: COLORS.successNeon,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
});

export default styles;
