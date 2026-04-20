import React, { useEffect, useRef, useState } from 'react';
import { InteractionManager, View, Text, Image, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import Animated, {
  cancelAnimation,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './splash.styles';

const SplashScreen = ({ onFinish }: any) => {
  const buttonScale = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);
  const [showCoinsAnimation, setShowCoinsAnimation] = useState(false);

  const interactionHandleRef =
    useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);

  useEffect(() => {
    buttonScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // ✅ Delay heavy animation until interactions finish
    interactionHandleRef.current = InteractionManager.runAfterInteractions(() => {
      setShowCoinsAnimation(true);
    });

    return () => {
      cancelAnimation(buttonScale);
      interactionHandleRef.current?.cancel?.();
    };
  }, [buttonScale]);

  const handlePress = () => {
    if (isPressed) return;

    setIsPressed(true);
    onFinish();
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

        {/* ✅ Combined: container + conditional rendering */}
        {showCoinsAnimation && (
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../../assets/animations/Falling_coins.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        )}
      </View>

      <SafeAreaView style={styles.bottomSection}>
        <Text style={styles.title}>
          Trusted{'\n'}& Secure{'\n'}Crypto Wallet
        </Text>
        <Text style={styles.subtitle}>
          Manage all your exchange account is easy
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