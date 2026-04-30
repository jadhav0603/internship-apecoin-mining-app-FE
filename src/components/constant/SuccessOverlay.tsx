import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './SuccessOverlay.style';


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
        source={require('../../assets/animations/success_claim.json')}
        autoPlay
        loop={false}
        style={styles.lottie}
        onAnimationFinish={onFinish}
      />

      <Text style={styles.label}>Reward Claimed!</Text>
    </View>
  );
};

export default SuccessOverlay;
