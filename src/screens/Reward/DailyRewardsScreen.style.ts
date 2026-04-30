import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060f06',
  },
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#060f06',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    top: 30,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  titleLine: {
    marginTop: 30,
    fontSize: 56,
    fontWeight: '900',
    color: '#39FF14',
    textAlign: 'center',
    lineHeight: 60,
    textShadowColor: 'rgba(57, 255, 20, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    letterSpacing: -1,
    transform: [{ scaleY: 1.1 }],
  },
  rewardsLine: {
    marginTop: -10,
  },
  lottieContainer: {
    width: width * 0.9,
    height: 200,
    backgroundColor: '#0d1f0d',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 10,
  },
  lottieFile: {
    width: '100%',
    height: '100%',
  },
  headerImage: {
    width: width * 1.2,
    height: 240,
    marginTop: 0,
    marginBottom: 0,
    alignSelf: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  backgroundImageStyle: {
    opacity: 0.2,
  },
  disabledButton: {
    backgroundColor: '#2a3e2a',
    shadowOpacity: 0,
    elevation: 0,
  },
  claimButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    color: '#39FF14',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default styles;
