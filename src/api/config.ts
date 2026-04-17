import { NativeModules, Platform } from 'react-native';

const DEV_PORT = 5000;
// Update this to your development machine's LAN IP so physical devices can reach the API
const DEV_LAN_HOST = '192.168.1.101';
const DEV_LAN_BASE_URL = `http://${DEV_LAN_HOST}:${DEV_PORT}/api`;

const unique = (values: string[]) => [...new Set(values)];

const stripPort = (value?: string | null) => {
  if (!value) {
    return null;
  }

  return value.split(':')[0] || null;
};

const isLoopbackHost = (host?: string | null) =>
  host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';

const getNativeServerHost = (): string | null => {
  const serverHost = NativeModules?.PlatformConstants?.ServerHost as string | undefined;
  return stripPort(serverHost);
};

const getMetroHost = (): string | null => {
  const scriptUrl = NativeModules?.SourceCode?.scriptURL as string | undefined;
  if (!scriptUrl) {
    return null;
  }

  try {
    return stripPort(new URL(scriptUrl).hostname);
  } catch {
    return null;
  }
};

const getAndroidDevHost = () => {
  const nativeServerHost = getNativeServerHost();
  if (nativeServerHost && !isLoopbackHost(nativeServerHost)) {
    return nativeServerHost;
  }

  const metroHost = getMetroHost();
  if (metroHost && !isLoopbackHost(metroHost)) {
    return metroHost;
  }

  return DEV_LAN_HOST;
};

const resolveBaseUrl = () => {
  if (__DEV__ && Platform.OS === 'android') {
    const nativeServerHost = getNativeServerHost();
    const metroHost = getMetroHost();

    if (isLoopbackHost(nativeServerHost) || isLoopbackHost(metroHost)) {
      return `http://10.0.2.2:${DEV_PORT}/api`;
    }

    return `http://${getAndroidDevHost()}:${DEV_PORT}/api`;
  }

  if (__DEV__) {
    return `http://127.0.0.1:${DEV_PORT}/api`;
  }

  // Replace with your production API host for release builds.
  return `http://127.0.0.1:${DEV_PORT}/api`;
};

export const getDevApiBaseUrls = () => {
  const urls = [resolveBaseUrl()];

  if (!__DEV__) {
    return unique(urls);
  }

  if (Platform.OS === 'android') {
    urls.push(`http://10.0.2.2:${DEV_PORT}/api`);

    const nativeServerHost = getNativeServerHost();
    if (nativeServerHost && !isLoopbackHost(nativeServerHost)) {
      urls.push(`http://${nativeServerHost}:${DEV_PORT}/api`);
    }

    const metroHost = getMetroHost();
    if (metroHost && !isLoopbackHost(metroHost)) {
      urls.push(`http://${metroHost}:${DEV_PORT}/api`);
    }
  }

  urls.push(
    DEV_LAN_BASE_URL,
    `http://127.0.0.1:${DEV_PORT}/api`,
    `http://localhost:${DEV_PORT}/api`
  );

  return unique(urls);
};

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),
  DEV_LAN_BASE_URL,
  TIMEOUT: 10000,
};

export const FIREBASE_CONFIG = {
  WEB_CLIENT_ID: '305778437662-la6356pofknniu4ee94m8mpl7dvevrbh.apps.googleusercontent.com',
};
