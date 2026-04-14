import React from 'react';
import { StyleSheet } from 'react-native';
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/COLORS';
import { FONTS } from '../constants/FONTS';
import HomeScreen from '../screens/home/HomeScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import RewardScreen from '../screens/Reward/RewardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { BottomTabParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    borderTopWidth: 0,
    borderRadius: 26,
    backgroundColor: 'rgba(7, 12, 6, 0.94)',
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 18,
  },
  tabLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  tabItem: {
    borderRadius: 18,
  },
});

const getTabBarIcon = (
  route: RouteProp<BottomTabParamList, keyof BottomTabParamList>,
  color: string,
  size: number,
) => {
  switch (route.name) {
    case 'Home':
      return <Ionicons name="home-outline" size={size} color={color} />;
    case 'Wallet':
      return <Ionicons name="wallet-outline" size={size} color={color} />;
    case 'Reward':
      return (
        <MaterialCommunityIcons
          name="gift-outline"
          size={size}
          color={color}
        />
      );
    case 'Profile':
      return <Ionicons name="person-outline" size={size} color={color} />;
    default:
      return null;
  }
};

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  const screenOptions = ({
    route,
  }: {
    route: RouteProp<BottomTabParamList, keyof BottomTabParamList>;
  }): BottomTabNavigationOptions => ({
    headerShown: false,
    lazy: true,
    freezeOnBlur: true,
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.textMuted,
    tabBarStyle: [
      styles.tabBar,
      {
        height: 66 + insets.bottom,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 10),
      },
    ],
    tabBarLabelStyle: styles.tabLabel,
    tabBarItemStyle: styles.tabItem,
    tabBarIconStyle: { marginTop: 2 },
    tabBarIcon: ({ color, size }) => getTabBarIcon(route, color, size),
  });

  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Reward" component={RewardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
