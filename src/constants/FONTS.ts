import { Platform } from 'react-native';

const fontFamilies = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    black: 'System',
  },
  android: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    semibold: 'sans-serif-medium',
    bold: 'sans-serif-bold',
    black: 'sans-serif-black',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    black: 'System',
  },
});

export const FONTS = {
  ...fontFamilies,
  letterSpacing: {
    tight: -0.6,
    normal: 0,
    wide: 1.2,
    ultraWide: 2.2,
  },
};
