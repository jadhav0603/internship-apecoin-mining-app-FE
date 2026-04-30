import React, { useCallback, useEffect, useRef } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { COLORS } from '../../constants/COLORS';
import styles from './SplashIntroAnimation.style';

type SplashIntroAnimationProps = {
  onFinish: () => void;
};

const INTRO_FALLBACK_MS = 4500;

const SplashIntroAnimation = ({ onFinish }: SplashIntroAnimationProps) => {
  const hasFinishedRef = useRef(false);

  const finish = useCallback(() => {
    if (hasFinishedRef.current) {
      return;
    }

    hasFinishedRef.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    const timeout = setTimeout(finish, INTRO_FALLBACK_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [finish]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.backgroundDeep}
      />
      <LottieView
        source={require('../../assets/animations/splash_screen.json')}
        autoPlay
        loop={false}
        resizeMode="cover"
        style={styles.animation}
        onAnimationFinish={finish}
      />
    </View>
  );
};

export default SplashIntroAnimation;
