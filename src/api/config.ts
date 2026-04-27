import { NativeModules, Platform } from 'react-native';

const DEV_PORT = 5000;
// Updated to current machine's LAN IP (192.168.1.101)
// This IP must be reachable from physical devices on the same network
// const DEV_LAN_HOST = '172.20.10.2';
const DEV_LAN_HOST = '192.168.1.49';
const DEV_LAN_BASE_URL = `http://${DEV_LAN_HOST}:${DEV_PORT}/api`;

const unique = (values: string[]) => [...new Set(values)];

const stripPort = (value?: string | null) => {
  if (!value) {
    return null;
  }

  return value.split(':')[0] || null;
};

const isLoopbackHost = (host?: string | null) =>
  !host || host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1';

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
    const parsed = new URL(scriptUrl);
    return stripPort(parsed.hostname);
  } catch {
    return null;
  }
};

const getAndroidDevHost = () => {
  // 1. Try to get the host from Metro (most reliable for dev machine's IP)
  const metroHost = getMetroHost();
  if (metroHost && !isLoopbackHost(metroHost)) {
    return metroHost;
  }

  // 2. Try to get the host from native modules
  const nativeServerHost = getNativeServerHost();
  if (nativeServerHost && !isLoopbackHost(nativeServerHost)) {
    return nativeServerHost;
  }

  // 3. Last resort fallback to the hardcoded LAN IP
  return DEV_LAN_HOST;
};

const resolveBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      const host = getAndroidDevHost();

      // For Android emulators, if we are still hitting loopback, use 10.0.2.2 
      // which points to the host machine.
      if (isLoopbackHost(host)) {
        return `http://10.0.2.2:${DEV_PORT}/api`;
      }

      return `http://${host}:${DEV_PORT}/api`;
    }

    // Default for iOS / Web development
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
  TIMEOUT: 15000, // Slightly longer timeout for network stability
};

export const FIREBASE_CONFIG = {
  WEB_CLIENT_ID: '305778437662-la6356pofknniu4ee94m8mpl7dvevrbh.apps.googleusercontent.com',
};
