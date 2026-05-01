import React from 'react';
import {
  Text,
  type StyleProp,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import LottieView from 'lottie-react-native';
import styles from './Loading.style';

type LoadingProps = {
  text?: string | null;
  size?: 'small' | 'medium' | 'large' | number;
  fullScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const SIZE_MAP = {
  small: 26,
  medium: 92,
  large: 180,
} as const;

const Loading = ({
  text = 'Loading...',
  size = 'large',
  fullScreen = false,
  style,
  contentStyle,
  textStyle,
}: LoadingProps) => {
  const resolvedSize =
    typeof size === 'number' ? size : SIZE_MAP[size] ?? SIZE_MAP.large;

  return (
    <View
      style={[
        styles.container,
        fullScreen ? styles.containerFullScreen : undefined,
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>
        <LottieView
          source={require('../../assets/animations/chimpanzee.json')}
          autoPlay
          loop
          renderMode="HARDWARE"
          style={{ width: resolvedSize, height: resolvedSize }}
          speed={0.9}
        />
        {text ? <Text style={[styles.text, textStyle]}>{text}</Text> : null}
      </View>
    </View>
  );
};

export default Loading;
