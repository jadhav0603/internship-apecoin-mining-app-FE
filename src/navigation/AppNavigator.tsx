import React from 'react';
import {
  DarkTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import SignIn from '../screens/Auth/SignIn';
import SignUp from '../screens/Auth/SignUp';
import SplashScreen from '../screens/splash/SplashScreen';
import MiningScreen from '../screens/mining/MiningScreen';
import { COLORS } from '../constants/COLORS';
import BottomTabNavigator from './BottomTabNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.background,
    card: COLORS.background,
    primary: COLORS.primary,
    border: 'transparent',
    text: COLORS.textPrimary,
    notification: COLORS.primary,
  },
};

const AppNavigator = () => {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: COLORS.background },
        }}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: 'none' }}
        />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen
          name="Mining"
          component={MiningScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
