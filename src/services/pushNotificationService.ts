import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  EventType,
  type Event,
} from '@notifee/react-native';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
  PermissionsAndroid,
  Platform,
  type PermissionStatus as RNPermissionStatus,
} from 'react-native';
import { navigationRef } from '../navigation/navigationRef';
import type { BottomTabParamList, RootStackParamList } from '../navigation/types';
import { userService } from './userService';

const ANDROID_CHANNEL_ID = 'apecoin-default-channel';
const isAndroid = Platform.OS === 'android';
const LAST_SYNCED_TOKEN_KEY = '@push:last-synced-token';
const LAST_SYNCED_UID_KEY = '@push:last-synced-uid';

type NotificationIntentData = Record<string, string>;

type NotificationRoute =
  | keyof RootStackParamList
  | keyof BottomTabParamList
  | 'Reward';

let hasInitialized = false;
let tokenRefreshUnsubscribe: (() => void) | null = null;
let foregroundMessageUnsubscribe: (() => void) | null = null;
let notificationOpenedUnsubscribe: (() => void) | null = null;
let notifeeForegroundUnsubscribe: (() => void) | null = null;
let pendingIntentData: NotificationIntentData | null = null;

const getFirebaseAuth = () => getAuth(getApp());

const normalizeString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const parseNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeIntentData = (value: unknown): NotificationIntentData | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      typeof entryValue === 'string' ? entryValue : JSON.stringify(entryValue),
    ]),
  );
};

const isAndroidNotificationsGranted = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const status = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return status;
};

const requestAndroidNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const result: RNPermissionStatus = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    return requestAndroidNotificationPermission();
  }

  const authorizationStatus = await messaging().requestPermission();
  return (
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
};

const ensureAndroidChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: 'General Notifications',
    importance: AndroidImportance.HIGH,
  });
};

const buildNotificationText = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  const title =
    remoteMessage.notification?.title ||
    normalizeString(remoteMessage.data?.title) ||
    'ApeCoin';
  const body =
    remoteMessage.notification?.body ||
    normalizeString(remoteMessage.data?.body) ||
    '';

  return { title, body };
};

const isBottomTabRoute = (screen: string): screen is keyof BottomTabParamList =>
  screen === 'Home' ||
  screen === 'Wallet' ||
  screen === 'Reward' ||
  screen === 'Profile';

const navigateFromNotificationData = (data?: NotificationIntentData | null) => {
  if (!data) {
    return;
  }

  if (!navigationRef.isReady()) {
    pendingIntentData = data;
    return;
  }

  const screen = normalizeString(data.screen) as NotificationRoute;
  const tab = normalizeString(data.tab);

  if (isBottomTabRoute(tab)) {
    navigationRef.navigate('MainTabs', { screen: tab });
    return;
  }

  switch (screen) {
    case 'Mining':
      navigationRef.navigate('Mining', {
        time: parseNumber(data.time),
      });
      return;
    case 'TransactionHistory':
      navigationRef.navigate('TransactionHistory');
      return;
    case 'TicketDetail': {
      const ticketId = normalizeString(data.ticketId);
      if (ticketId) {
        navigationRef.navigate('TicketDetail', { ticketId });
      }
      return;
    }
    case 'TicketList':
    case 'ReportIssue':
    case 'Leaderboard':
    case 'ReferAndEarn':
    case 'MyProgress':
    case 'ProfileDetails':
    case 'AboutUs':
    case 'OtherApps':
    case 'CheckUpdate':
    case 'FAQ':
    case 'TermsAndConditions':
    case 'ConnectUs':
      navigationRef.navigate(screen);
      return;
    case 'Home':
    case 'Wallet':
    case 'Reward':
    case 'Profile':
      navigationRef.navigate('MainTabs', { screen });
      return;
    case 'MainTabs':
      navigationRef.navigate('MainTabs');
      return;
    default:
      navigationRef.navigate('MainTabs', { screen: 'Home' });
  }
};

const handleNotificationIntent = (
  data?: NotificationIntentData | null,
) => {
  navigateFromNotificationData(data ?? null);
};

const maybeDisplayLocalNotification = async (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => {
  const { title, body } = buildNotificationText(remoteMessage);

  if (!title && !body) {
    return;
  }

  await ensureAndroidChannel();

  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage.data,
    android: {
      channelId: ANDROID_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
      smallIcon: 'ic_launcher_monochrome',
    },
  });
};

const persistSyncedToken = async (uid: string, token: string) => {
  await AsyncStorage.multiSet([
    [LAST_SYNCED_UID_KEY, uid],
    [LAST_SYNCED_TOKEN_KEY, token],
  ]);
};

const clearPersistedSyncedToken = async () => {
  await AsyncStorage.multiRemove([LAST_SYNCED_UID_KEY, LAST_SYNCED_TOKEN_KEY]);
};

const shouldSyncToken = async (uid: string, token: string, force = false) => {
  if (force) {
    return true;
  }

  const [[, lastUid], [, lastToken]] = await AsyncStorage.multiGet([
    LAST_SYNCED_UID_KEY,
    LAST_SYNCED_TOKEN_KEY,
  ]);

  return lastUid !== uid || lastToken !== token;
};

const registerRemoteMessages = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();
  } catch (error) {
    if (__DEV__) {
      console.warn('[push] registerDeviceForRemoteMessages failed', error);
    }
  }
};

export const pushNotificationService = {
  async initialize() {
    if (!isAndroid) {
      return;
    }

    if (hasInitialized) {
      return;
    }

    hasInitialized = true;

    await ensureAndroidChannel();
    await registerRemoteMessages();
    await requestNotificationPermission().catch(() => false);

    tokenRefreshUnsubscribe = messaging().onTokenRefresh((token: string) => {
      void this.syncCurrentDeviceToken(token, true).catch(error => {
        if (__DEV__) {
          console.warn('[push] token refresh sync failed', error);
        }
      });
    });

    foregroundMessageUnsubscribe = messaging().onMessage(
      (
        remoteMessage: FirebaseMessagingTypes.RemoteMessage,
      ) => {
      void maybeDisplayLocalNotification(remoteMessage).catch(error => {
        if (__DEV__) {
          console.warn('[push] foreground notification failed', error);
        }
      });
      },
    );

    notificationOpenedUnsubscribe = messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        handleNotificationIntent(normalizeIntentData(remoteMessage?.data));
      },
    );

    notifeeForegroundUnsubscribe = notifee.onForegroundEvent(
      ({ type, detail }: Event) => {
        if (type !== EventType.PRESS) {
          return;
        }

        handleNotificationIntent(
          normalizeIntentData(detail.notification?.data),
        );
      },
    );

    const [initialRemoteMessage, initialNotifeeNotification] =
      await Promise.all([
        messaging().getInitialNotification(),
        notifee.getInitialNotification(),
      ]);

    handleNotificationIntent(normalizeIntentData(initialRemoteMessage?.data));
    handleNotificationIntent(
      normalizeIntentData(initialNotifeeNotification?.notification?.data),
    );
  },

  onNavigationReady() {
    if (!pendingIntentData) {
      return;
    }

    const nextIntent = pendingIntentData;
    pendingIntentData = null;
    navigateFromNotificationData(nextIntent);
  },

  async syncCurrentDeviceToken(tokenOverride?: string, force = false) {
    if (!isAndroid) {
      return null;
    }

    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) {
      return null;
    }

    const permissionGranted =
      Platform.OS === 'android'
        ? await isAndroidNotificationsGranted()
        : true;

    if (!permissionGranted) {
      const requested = await requestNotificationPermission().catch(() => false);
      if (!requested) {
        return null;
      }
    }

    await registerRemoteMessages();

    const token = tokenOverride ?? (await messaging().getToken());
    if (!token) {
      return null;
    }

    const shouldSync = await shouldSyncToken(currentUser.uid, token, force);
    if (!shouldSync) {
      return token;
    }

    await userService.registerPushToken(token);
    await persistSyncedToken(currentUser.uid, token);

    return token;
  },

  async unregisterCurrentDeviceToken() {
    if (!isAndroid) {
      return;
    }

    const currentUser = getFirebaseAuth().currentUser;
    const storedEntries = await AsyncStorage.multiGet([
      LAST_SYNCED_UID_KEY,
      LAST_SYNCED_TOKEN_KEY,
    ]);
    const storedToken = storedEntries[1]?.[1] ?? null;

    let currentToken = storedToken;

    try {
      currentToken = currentToken ?? (await messaging().getToken());
    } catch {
      // Ignore token lookup failures and still clear local sync state.
    }

    if (currentUser && currentToken) {
      await userService.unregisterPushToken(currentToken).catch(() => undefined);
    }

    await clearPersistedSyncedToken();
  },

  async handleBackgroundRemoteMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ) {
    if (!isAndroid) {
      return;
    }

    if (!remoteMessage.notification) {
      await maybeDisplayLocalNotification(remoteMessage);
    }
  },

  async handleBackgroundNotificationEvent(event: Event) {
    if (!isAndroid) {
      return;
    }

    if (__DEV__ && event.type === EventType.PRESS) {
      console.log('[push] background notification pressed');
    }
  },

  cleanup() {
    tokenRefreshUnsubscribe?.();
    foregroundMessageUnsubscribe?.();
    notificationOpenedUnsubscribe?.();
    notifeeForegroundUnsubscribe?.();
    tokenRefreshUnsubscribe = null;
    foregroundMessageUnsubscribe = null;
    notificationOpenedUnsubscribe = null;
    notifeeForegroundUnsubscribe = null;
    hasInitialized = false;
  },
};
