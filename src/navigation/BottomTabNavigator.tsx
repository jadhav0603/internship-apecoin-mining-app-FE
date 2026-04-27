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
import {
  FLOATING_TAB_BAR_BASE_HEIGHT,
  FLOATING_TAB_BAR_BOTTOM_OFFSET,
} from '../constants/bottomLayout';
import BottomTab from '../components/bottomTab/BottomTab';
import HomeScreen from '../screens/home/HomeScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import DailyRewardsScreen from '../screens/Reward/DailyRewardsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { BottomTabParamList } from './types';
import { View } from 'react-native';
import MiningLiveBar from '../components/mining/MiningLiveBar';


const Tab = createBottomTabNavigator<BottomTabParamList>();
const renderTabBarButton = (props: React.ComponentProps<typeof BottomTab>) => (
  <BottomTab {...props} />
);

const styles = StyleSheet.create({
  tabBar: {
  position: 'absolute',
  left: 16,
  right: 16,
  bottom: FLOATING_TAB_BAR_BOTTOM_OFFSET,
  borderTopWidth: 0,
  borderRadius: 28,
  backgroundColor: 'rgba(7, 12, 6, 0.96)',

  overflow: 'visible', 

  shadowColor: '#000000',
  shadowOpacity: 0.22,
  shadowRadius: 18,
  shadowOffset: {
    width: 0,
    height: 10,
  },
  elevation: 18,
  paddingHorizontal: 10,
},
  tabLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  tabItem: {
    overflow: 'visible',
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
    tabBarActiveTintColor: COLORS.textDark,
    tabBarInactiveTintColor: COLORS.textMuted,
    tabBarActiveBackgroundColor: 'transparent',
    tabBarInactiveBackgroundColor: 'transparent',
    tabBarStyle: [
      styles.tabBar,
      {
        height: FLOATING_TAB_BAR_BASE_HEIGHT + insets.bottom,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 10),
      },
    ],
    tabBarLabelStyle: styles.tabLabel,
    tabBarItemStyle: styles.tabItem,
    tabBarIconStyle: { marginTop: 2 },
    tabBarButton: renderTabBarButton,
    tabBarIcon: ({ color, size }) => getTabBarIcon(route, color, size),
  });

 return (
  <View style={{ flex: 1 }}>
    
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={screenOptions}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Reward" component={DailyRewardsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>

    {/* ✅ LIVE BAR */}
    <MiningLiveBar />

  </View>
);
};

export default BottomTabNavigator;
