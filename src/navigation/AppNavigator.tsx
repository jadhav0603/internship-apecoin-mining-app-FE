import React, { useEffect, useState } from 'react';
import {
  DarkTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";

// Screens
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

const AppNavigator = () => {
  // const [user, setUser] = useState<any>(null); 
  const {user,setUser} = useUser();
  const [initializing, setInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

 useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 🔥 FETCH FROM MONGODB
          const userData = await userService.getMe();
          setUser(userData); // store backend user
        } catch (err) {
          console.log("User fetch error", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  //   if (initializing) {
  //   return <SplashScreen />;
  // }

  return (

    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash" >

        {showSplash && (
      <Stack.Screen name="Splash">
        {(props) => (
          <SplashScreen
            {...props}
            onFinish={() => setShowSplash(false)} 
          />
        )}
      </Stack.Screen>
    )}

        { user ? (
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