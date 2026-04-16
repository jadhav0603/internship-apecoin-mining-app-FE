import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import Animated, {
  cancelAnimation,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './splash.styles';
import { useNavigation } from '@react-navigation/native';

import { getAuth } from '@react-native-firebase/auth';

const SplashScreen = ({ onFinish }: any) => {
  const buttonScale = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef<any>(null);

  const navigation = useNavigation();

  useEffect(() => {
    buttonScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(buttonScale);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePress = () => {
  if (isPressed) return;

  setIsPressed(true);

  setTimeout(() => {
    onFinish();
  }, 300);
};

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={require('../../assets/images/splashScreen-2.png')}
          style={styles.image}
        />

        <LinearGradient
          colors={['transparent', 'rgba(10,15,10,0.8)', '#0A0F0A']}
          style={styles.gradientOverlay}
        />

        <LottieView
          source={require('../../assets/animations/Falling_coins.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>

      <SafeAreaView style={styles.bottomSection}>
        <Text style={styles.title}>
          Trusted{'\n'}& Secure{'\n'}Crypto Wallet
        </Text>

        <Pressable onPress={handlePress}>
          <Animated.View style={[styles.button, animatedButtonStyle]}>
            <Text style={styles.buttonText}>
              {isPressed ? 'Opening...' : 'Get Started'}
            </Text>
          </Animated.View>
        </Pressable>
      </SafeAreaView>
    </View>
  );
};

export default SplashScreen;