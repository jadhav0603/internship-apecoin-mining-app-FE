import React, { useEffect } from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/constants/COLORS';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { TimeModalProvider } from './src/context/TimeModal';
import { MiningProvider } from './src/context/MiningContext';
import { WalletProvider } from './src/context/WalletContext';
import { AlertProvider } from './src/context/AlertContext';
import mobileAds from 'react-native-google-mobile-ads';
import { useUser } from './src/context/UserContext';
import { pushNotificationService } from './src/services/pushNotificationService';

mobileAds()
  .initialize()
  .then(adapterStatuses => {
    console.log('Mobile Ads SDK initialized');
  });

const NotificationBootstrap = () => {
  const { user } = useUser();

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    void pushNotificationService.initialize().catch(error => {
      if (__DEV__) {
        console.warn('[push] initialize failed', error);
      }
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    if (!user?.uid) {
      return;
    }

    void pushNotificationService.syncCurrentDeviceToken().catch(error => {
      if (__DEV__) {
        console.warn('[push] token sync failed', error);
      }
    });
  }, [user?.uid]);

  return null;
};

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <UserProvider>
        <NotificationBootstrap />
        <TimeModalProvider>
          <MiningProvider>
            <WalletProvider>
              <AlertProvider>
                <SafeAreaProvider>
                  <StatusBar
                    barStyle="light-content"
                    backgroundColor={COLORS.backgroundDeep}
                  />
                  <AppNavigator />
                </SafeAreaProvider>
              </AlertProvider>
            </WalletProvider>
          </MiningProvider>
        </TimeModalProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
