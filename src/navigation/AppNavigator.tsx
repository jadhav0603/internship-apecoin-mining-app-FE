import React, { useEffect, useState } from 'react';
import {
  DarkTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

import SignIn from '../screens/Auth/SignIn';
import SignUp from '../screens/Auth/SignUp';
import AccountBlockedScreen from '../screens/Auth/AccountBlockedScreen';
import SplashScreen from '../screens/splash/SplashScreen';
import SplashIntroAnimation from '../screens/splash/SplashIntroAnimation';
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
import OtherAppsScreen from '../screens/profile/OtherAppsScreen';
import CheckUpdateScreen from '../screens/profile/CheckUpdateScreen';
import FAQScreen from '../screens/profile/FAQScreen';
import TermsAndConditionsScreen from '../screens/profile/TermsAndConditionsScreen';
import ConnectUsScreen from '../screens/profile/ConnectUsScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { COLORS } from '../constants/COLORS';
import Loading from '../components/constant/Loading';
import TermsModal from '../components/terms/TermsModal';

import { RootStackParamList } from './types';
import { useUser } from '../context/UserContext';
import { userService } from '../services/userService';
import {
  clearBlockedAccount,
  getBlockedAccountFromStatus,
  getBlockedAccount,
  isBlockedAccountError,
  setBlockedAccount,
  subscribeBlockedAccount,
} from '../session/blockedAccountState';
import { authService } from '../services/authService';

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

const AuthLoadingScreen = () => <Loading text="L O A D I N G . . . . ." />;

const mapFirebaseUserToAppUser = (
  firebaseUser: NonNullable<ReturnType<typeof getAuth>['currentUser']>,
) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email ?? '',
  displayName:
    firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
  photoURL: firebaseUser.photoURL ?? '',
  plan: 'Free',
});

const AppNavigator = () => {
  const { user, setUser } = useUser();
  const [showIntroAnimation, setShowIntroAnimation] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [blockedAccount, setBlockedAccountState] = useState(
    getBlockedAccount(),
  );
  const [termsVisible, setTermsVisible] = useState(false);
  const [acceptingTerms, setAcceptingTerms] = useState(false);
  const [dismissedTermsForUid, setDismissedTermsForUid] = useState<
    string | null
  >(null);

  useEffect(() => subscribeBlockedAccount(setBlockedAccountState), []);

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
          const syncResponse = await authService.syncCurrentSession();

          if (!isMounted || requestId !== authRequestId) {
            return;
          }

          const blockedFromSync = getBlockedAccountFromStatus(
            syncResponse?.user?.status,
            {
              source: 'login',
              email: syncResponse?.user?.email ?? firebaseUser.email ?? null,
              reason: syncResponse?.user?.bannedReason ?? null,
            },
          );

          if (blockedFromSync) {
            setBlockedAccount({
              ...blockedFromSync,
              sessionToken:
                getBlockedAccount()?.sessionToken ??
                (await firebaseUser.getIdToken().catch(() => null)),
            });
            setUser({
              ...mapFirebaseUserToAppUser(firebaseUser as any),
              ...syncResponse?.user,
            });
            setAuthStatus('authenticated');
            return;
          }

          const userData = await userService.getMe();

          if (!isMounted || requestId !== authRequestId) {
            return;
          }

          const blockedFromStatus = getBlockedAccountFromStatus(
            userData?.status,
            {
              source: 'login',
              email: userData?.email ?? firebaseUser.email ?? null,
            },
          );

          if (blockedFromStatus) {
            setBlockedAccount({
              ...blockedFromStatus,
              sessionToken:
                getBlockedAccount()?.sessionToken ??
                (await firebaseUser.getIdToken().catch(() => null)),
            });
            setUser({
              ...mapFirebaseUserToAppUser(firebaseUser as any),
              ...userData,
            });
            setAuthStatus('authenticated');
            return;
          }

          clearBlockedAccount();
          setUser({
            ...mapFirebaseUserToAppUser(firebaseUser as any),
            ...userData,
          });
          setAuthStatus('authenticated');
        } catch (error) {
          if (isBlockedAccountError(error)) {
            return;
          }

          if (__DEV__) {
            console.log(
              '[auth] failed to verify backend user status during bootstrap',
              error,
            );
          }

          if (!isMounted || requestId !== authRequestId) {
            return;
          }

          setUser(null);
          setAuthStatus('unauthenticated');
          void authService.clearSession().catch(() => undefined);
        }
      };

      bootstrapSession().catch(() => undefined);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setUser]);

  useEffect(() => {
    if (
      authStatus === 'authenticated' &&
      user?.uid &&
      !user.acceptedTerms &&
      !blockedAccount &&
      dismissedTermsForUid !== user.uid
    ) {
      setTermsVisible(true);
      return;
    }

    if (
      user?.acceptedTerms ||
      authStatus !== 'authenticated' ||
      blockedAccount
    ) {
      setTermsVisible(false);
    }
  }, [
    authStatus,
    blockedAccount,
    dismissedTermsForUid,
    user?.acceptedTerms,
    user?.uid,
  ]);

  const handleAcceptTerms = async () => {
    if (acceptingTerms) {
      return;
    }

    try {
      setAcceptingTerms(true);
      const updatedUser = await userService.acceptTerms();
      setUser(prev =>
        prev ? { ...prev, ...updatedUser, acceptedTerms: true } : prev,
      );
      setTermsVisible(false);
      setDismissedTermsForUid(null);
    } catch (error) {
      if (__DEV__) {
        console.log('[terms] failed to accept terms:', error);
      }
    } finally {
      setAcceptingTerms(false);
    }
  };

  if (showIntroAnimation) {
    return (
      <SplashIntroAnimation onFinish={() => setShowIntroAnimation(false)} />
    );
  }

  return (
    <>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {blockedAccount ? (
            <>
              <Stack.Screen name="AccountBlocked">
                {props => (
                  <AccountBlockedScreen
                    {...props}
                    key={`${blockedAccount.type}:${blockedAccount.source}`}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
            </>
          ) : authStatus === 'loading' ? (
            <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
          ) : authStatus === 'authenticated' ? (
            <>
              <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
              <Stack.Screen name="Mining" component={MiningScreen} />
              <Stack.Screen
                name="TransactionHistory"
                component={TransactionHistoryScreen}
              />
              <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
              <Stack.Screen name="TicketList" component={TicketListScreen} />
              <Stack.Screen
                name="TicketDetail"
                component={TicketDetailScreen}
              />
              <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
              <Stack.Screen
                name="ReferAndEarn"
                component={ReferAndEarnScreen}
              />
              <Stack.Screen name="MyProgress" component={MyProgressScreen} />
              <Stack.Screen
                name="ProfileDetails"
                component={ProfileDetailsScreen}
              />
              <Stack.Screen name="AboutUs" component={AboutUsScreen} />
              <Stack.Screen name="OtherApps" component={OtherAppsScreen} />
              <Stack.Screen name="CheckUpdate" component={CheckUpdateScreen} />
              <Stack.Screen name="FAQ" component={FAQScreen} />
              <Stack.Screen
                name="TermsAndConditions"
                component={TermsAndConditionsScreen}
              />
              <Stack.Screen name="ConnectUs" component={ConnectUsScreen} />
            </>
          ) : showSplash ? (
            <Stack.Screen name="Splash">
              {props => (
                <SplashScreen
                  {...props}
                  onFinish={() => setShowSplash(false)}
                />
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="SignIn" component={SignIn} />
              <Stack.Screen name="SignUp" component={SignUp} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <TermsModal
        visible={termsVisible}
        accepting={acceptingTerms}
        onAccept={handleAcceptTerms}
        onClose={() => {
          if (user?.uid) {
            setDismissedTermsForUid(user.uid);
          }
          setTermsVisible(false);
        }}
      />
    </>
  );
};

export default AppNavigator;
