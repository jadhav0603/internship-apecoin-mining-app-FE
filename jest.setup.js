/* eslint-env jest */

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: require('react-native').View,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) =>
    require('react').createElement(require('react-native').View, null, children),
  SafeAreaView: ({ children }) =>
    require('react').createElement(require('react-native').View, null, children),
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  screensEnabled: jest.fn(() => false),
  Screen: require('react-native').View,
  ScreenContainer: require('react-native').View,
  ScreenStack: require('react-native').View,
  ScreenStackHeaderConfig: require('react-native').View,
  ScreenStackHeaderSubview: require('react-native').View,
  NativeScreen: require('react-native').View,
  NativeScreenContainer: require('react-native').View,
  FullWindowOverlay: require('react-native').View,
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('lottie-react-native', () => 'LottieView');

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Circle: 'Circle',
  Defs: 'Defs',
  Ellipse: 'Ellipse',
  RadialGradient: 'RadialGradient',
  Stop: 'Stop',
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock(
  'react-native-vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons',
);
jest.mock('react-native-vector-icons/FontAwesome5', () => 'FontAwesome5');
