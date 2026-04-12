import React, { useEffect } from 'react';
import { View, Text, Image, TouchableWithoutFeedback } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './splash.styles';
import { RootStackParamList } from '../../navigation/types';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    buttonScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [buttonScale]);

  const navigateToNextScreen = () => {
    const isLoggedIn = false;
    if (isLoggedIn) {
      navigation.replace('Mining');
    } else {
      navigation.replace('Login');
    }
  };

  const handlePress = () => {
    translateY.value = withTiming(-800, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    opacity.value = withTiming(0, {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }, (finished) => {
      if (finished) {
        runOnJS(navigateToNextScreen)();
      }
    });
  };

  const animatedScreenStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
      flex: 1,
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedScreenStyle]}>
      <View style={styles.topSection}>
        <Image
          source={require('../../assets/images/splashScreen.webp')}
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
        
        <TouchableWithoutFeedback onPress={handlePress}>
          <Animated.View style={[styles.button, animatedButtonStyle]}>
            <Text style={styles.buttonText}>Get Started</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Animated.View>
  );
};

export default SplashScreen;
