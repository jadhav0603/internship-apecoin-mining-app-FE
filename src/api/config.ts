import { Platform } from 'react-native';

const DEV_PORT = 5000;
const DEV_LAN_HOST = '192.168.1.101';
const DEV_LAN_BASE_URL = `http://${DEV_LAN_HOST}:${DEV_PORT}/api`;

const resolveBaseUrl = () => {
  // Physical Android devices should call backend over LAN IP.
  if (__DEV__ && Platform.OS === 'android') {
    return DEV_LAN_BASE_URL;
  }

  if (__DEV__) {
    return `http://127.0.0.1:${DEV_PORT}/api`;
  }

  // Replace with your production API host for release builds.
  return `http://127.0.0.1:${DEV_PORT}/api`;
};

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),
  DEV_LAN_BASE_URL,
  TIMEOUT: 10000,
};

export const FIREBASE_CONFIG = {
  WEB_CLIENT_ID: '305778437662-la6356pofknniu4ee94m8mpl7dvevrbh.apps.googleusercontent.com',
};
