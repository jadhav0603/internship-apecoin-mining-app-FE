/**
 * @format
 */
import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import { Platform } from 'react-native';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { pushNotificationService } from './src/services/pushNotificationService';
import 'react-native-gesture-handler';

if (Platform.OS === 'android') {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await pushNotificationService.handleBackgroundRemoteMessage(remoteMessage);
  });

  notifee.onBackgroundEvent(async event => {
    await pushNotificationService.handleBackgroundNotificationEvent(event);
  });
}

AppRegistry.registerComponent(appName, () => App);
