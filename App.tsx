import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/constants/COLORS';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';
import { TimeModalProvider } from './src/context/TimeModal';
import { MiningProvider } from './src/context/MiningContext';
import { WalletProvider } from './src/context/WalletContext';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <UserProvider>
        <TimeModalProvider>
          <MiningProvider>
            <WalletProvider>
              <SafeAreaProvider>
                <StatusBar
                  barStyle="light-content"
                  backgroundColor={COLORS.backgroundDeep}
                />
                <AppNavigator />
              </SafeAreaProvider>
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
