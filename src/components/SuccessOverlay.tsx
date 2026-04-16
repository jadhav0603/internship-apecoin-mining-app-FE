import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SuccessOverlayProps {
  visible: boolean;
  onFinish: () => void;
}

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ visible, onFinish }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Radial neon green glow behind animation */}
      <LinearGradient
        colors={['rgba(57,255,20,0.18)', 'rgba(0,0,0,0)']}
        style={styles.glow}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
      />

      <LottieView
        source={require('../assets/animations/success_claim.json')}
        autoPlay
        loop={false}
        style={styles.lottie}
        onAnimationFinish={onFinish}
      />

      <Text style={styles.label}>Reward Claimed!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#050f05',
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
    color: '#39FF14',
    fontWeight: '900',
    fontSize: 22,
    marginTop: 10,
    letterSpacing: 1.5,
    textShadowColor: '#39FF14',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
});

export default SuccessOverlay;
