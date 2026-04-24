import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  DarkTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

import SignIn from '../screens/Auth/SignIn';
import SignUp from '../screens/Auth/SignUp';
import SplashScreen from '../screens/splash/SplashScreen';
import MiningScreen from '../screens/mining/MiningScreen';
import LeaderboardScreen from '../screens/profile/LeaderboardScreen';
import ReferAndEarnScreen from '../screens/profile/ReferAndEarnScreen';
import MyProgressScreen from '../screens/profile/MyProgressScreen';
import ProfileDetailsScreen from '../screens/profile/ProfileDetailsScreen';
import ReportIssueScreen from '../screens/profile/ReportIssueScreen';
import AboutUsScreen from '../screens/profile/AboutUsScreen';
import TicketListScreen from '../screens/profile/TicketListScreen';
import TicketDetailScreen from '../screens/profile/TicketDetailScreen';
import TransactionHistoryScreen from '../screens/home/TransactionHistoryScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { COLORS } from '../constants/COLORS';

import { RootStackParamList } from './types';
import { useUser } from '../context/UserContext';
import { userService } from '../services/userService';

const Stack = createNativeStackNavigator<RootStackParamList>();

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

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

const AuthLoadingScreen = () => (
  <View style={styles.loadingScreen}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

const mapFirebaseUserToAppUser = (firebaseUser: NonNullable<ReturnType<typeof getAuth>['currentUser']>) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email ?? '',
  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  photoURL: firebaseUser.photoURL ?? '',
  plan: 'Free',
});

const AppNavigator = () => {
  const { setUser } = useUser();
  const [showSplash, setShowSplash] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const auth = getAuth();
    let isMounted = true;
    let authRequestId = 0;

    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      const requestId = ++authRequestId;

      const bootstrapSession = async () => {
        if (!firebaseUser) {
          if (!isMounted || requestId !== authRequestId) {
            return;
          }

          setUser(null);
          setAuthStatus('unauthenticated');
          return;
        }

        if (isMounted && requestId === authRequestId) {
          setAuthStatus('loading');
        }

        try {
          const userData = await userService.getMe();

          if (!isMounted || requestId !== authRequestId) {
            return;
          }

          setUser({
             ...mapFirebaseUserToAppUser(firebaseUser as any),
             ...userData,
          });
          setAuthStatus('authenticated');
        } catch (error) {
          if (__DEV__) {
            console.log('[auth] failed to hydrate backend user, using Firebase session fallback', error);
          }

          if (!isMounted || requestId !== authRequestId) {
            return;
          }

          setUser(mapFirebaseUserToAppUser(firebaseUser as any));
          setAuthStatus('authenticated');
        }
      };

      bootstrapSession().catch(() => undefined);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setUser]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        {showSplash ? (
          <Stack.Screen name="Splash">
            {props => (
              <SplashScreen
                {...props}
                onFinish={() => setShowSplash(false)}
              />
            )}
          </Stack.Screen>
        ) : authStatus === 'loading' ? (
          <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        ) : authStatus === 'authenticated' ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="Mining" component={MiningScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
            <Stack.Screen name="TicketList" component={TicketListScreen} />
            <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="ReferAndEarn" component={ReferAndEarnScreen} />
            <Stack.Screen name="MyProgress" component={MyProgressScreen} />
            <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppNavigator;
