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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './splash.styles';
import { RootStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const buttonScale = useSharedValue(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    buttonScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(buttonScale);

      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [buttonScale]);

  const navigateToNextScreen = async () => {
    try {
      const user =
        authService.getCurrentUser() ?? (await authService.waitForAuthRestore());

      if (user) {
        navigation.replace('MainTabs', {screen: 'Home'});
        return;
      }

      navigation.replace('SignIn');
    } catch {
      navigation.replace('SignIn');
    }
  };

  const handlePress = () => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);
    cancelAnimation(buttonScale);
    buttonScale.value = withTiming(0.97, { duration: 120 });
    navigationTimeoutRef.current = setTimeout(navigateToNextScreen, 140);
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={require('../../assets/images/splashScreen-2.png')}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(10, 15, 10, 0.8)', '#0A0F0A']}
          style={styles.gradientOverlay}
          locations={[0.4, 0.8, 1]}
        />
        <View style={styles.lottieContainer} pointerEvents="none">
          <LottieView
            source={require('../../assets/animations/Falling_coins.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.bottomSection}>
        <Text style={styles.title}>Trusted{'\n'}& Secure{'\n'}Crypto Wallet</Text>
        <Text style={styles.subtitle}>Manage all your exchange accounts is easy</Text>

        <Pressable disabled={isNavigating} onPress={handlePress}>
          <Animated.View style={[styles.button, animatedButtonStyle]}>
            <Text style={styles.buttonText}>
              {isNavigating ? 'Opening...' : 'Get Started'}
            </Text>
          </Animated.View>
        </Pressable>
      </SafeAreaView>
    </View>
  );
};

export default SplashScreen;
