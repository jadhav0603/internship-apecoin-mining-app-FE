import React, { startTransition, useEffect, useState } from 'react';
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
import BottomTabNavigator from './BottomTabNavigator';
import { COLORS } from '../constants/COLORS';
import { useUser } from '../context/UserContext';
import { userService } from '../services/userService';

const Stack = createNativeStackNavigator();

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

const mapFirebaseUserToAppUser = (firebaseUser: FirebaseAuthTypes.User) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email ?? '',
  displayName: firebaseUser.displayName ?? firebaseUser.email ?? 'ApeCoin User',
  photoURL: firebaseUser.photoURL ?? undefined,
  plan: 'Free',
});

const AppNavigator = () => {
  const { user, setUser } = useUser();
  const [initializing, setInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    let isActive = true;

    const hydrateBackendUser = async (firebaseUser: FirebaseAuthTypes.User) => {
      try {
        const userData = await userService.getMe();

        if (!isActive) {
          return;
        }

        startTransition(() => {
          setUser((currentUser: any) => {
            if (currentUser?.uid && currentUser.uid !== firebaseUser.uid) {
              return currentUser;
            }

            return {
              ...mapFirebaseUserToAppUser(firebaseUser),
              ...userData,
            };
          });
        });
      } catch (error) {
        if (__DEV__) {
          console.log('User fetch error', error);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      if (firebaseUser) {
        startTransition(() => {
          setUser(mapFirebaseUserToAppUser(firebaseUser));
        });
        setInitializing(false);
        hydrateBackendUser(firebaseUser);
        return;
      }

      startTransition(() => {
        setUser(null);
      });
      setInitializing(false);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [setUser]);

  const isSplashVisible = showSplash || initializing;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Splash"
      >
        {isSplashVisible && (
          <Stack.Screen name="Splash">
            {props => (
              <SplashScreen
                {...props}
                onFinish={() => setShowSplash(false)}
              />
            )}
          </Stack.Screen>
        )}

        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="Mining" component={MiningScreen} />
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

export default AppNavigator;
