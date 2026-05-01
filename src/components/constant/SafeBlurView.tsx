import React from 'react';
import {
  Platform,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {getAndroidFallbackStyle} from './SafeBlurView.style';

type SafeBlurViewProps = {
  style?: StyleProp<ViewStyle>;
  blurType?: 'light' | 'dark';
  blurAmount?: number;
  reducedTransparencyFallbackColor?: string;
};

const SafeBlurView: React.FC<SafeBlurViewProps> = ({
  style,
  blurType = 'dark',
  blurAmount = 12,
  reducedTransparencyFallbackColor = 'rgba(0,0,0,0.7)',
}) => {
  if (Platform.OS === 'android') {
    return (
      <View
        pointerEvents="none"
        style={getAndroidFallbackStyle(style, reducedTransparencyFallbackColor)}
      />
    );
  }

  return (
    <BlurView
      style={style}
      blurType={blurType}
      blurAmount={blurAmount}
      reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
    />
  );
};

export default SafeBlurView;
