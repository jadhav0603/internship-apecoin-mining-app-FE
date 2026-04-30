import type { StyleProp, ViewStyle } from 'react-native';

export const getAndroidFallbackStyle = (
  style: StyleProp<ViewStyle>,
  reducedTransparencyFallbackColor: string,
) => [style, { backgroundColor: reducedTransparencyFallbackColor }];
