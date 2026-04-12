import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants/COLORS'

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topSection: {
    flex: 1,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: "absolute",
    // bottom: -height * 0.15,
    // width: "140%",
    // height: height * 0.4,
    backgroundColor: COLORS.primary,
    // borderRadius: height * 4,
    // alignSelf: "center",
    borderBottomLeftRadius: 100,
borderBottomRightRadius: 100,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
  },
  lottieContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: width * 1.5,
    height: width * 1.5,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    justifyContent: 'flex-start',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 46,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 40,
    fontWeight: '400',
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
});
