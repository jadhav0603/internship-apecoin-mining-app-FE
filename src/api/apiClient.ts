import axios from 'axios';
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { API_CONFIG, getDevApiBaseUrls } from './config';

// Lazy getter — avoids calling getApp()/getAuth() at module load time,
// which would crash if Firebase hasn't initialized yet (causing the entire
// module to be undefined and surfacing as "Cannot read property 'MiningProvider'
// of undefined" in App.tsx).
let _firebaseAuth: ReturnType<typeof getAuth> | null = null;
const getFirebaseAuth = () => {
  if (!_firebaseAuth) {
    _firebaseAuth = getAuth(getApp());
  }
  return _firebaseAuth;
};

let cachedBearerToken: string | null = null;
let cachedTokenExpiry = 0;
let cachedTokenUserUid: string | null = null;

const getAuthorizationHeader = async () => {
  const user = getFirebaseAuth().currentUser;

  if (!user) {
    cachedBearerToken = null;
    cachedTokenExpiry = 0;
    cachedTokenUserUid = null;
    return null;
  }

  const now = Date.now();
  if (
    cachedBearerToken &&
    cachedTokenUserUid === user.uid &&
    now < cachedTokenExpiry
  ) {
    return `Bearer ${cachedBearerToken}`;
  }

  const tokenResult = await user.getIdTokenResult();
  cachedBearerToken = tokenResult.token;
  cachedTokenUserUid = user.uid;
  cachedTokenExpiry = Math.max(
    now,
    new Date(tokenResult.expirationTime).getTime() - 60 * 1000
  );

  return `Bearer ${tokenResult.token}`;
};

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helpful debug: show which baseURL we're using in dev builds
if (__DEV__) {
  console.debug('[apiClient] baseURL:', apiClient.defaults.baseURL);
}

apiClient.interceptors.request.use(
  async (config) => {
    if (!config.headers?.Authorization) {
      const authorizationHeader = await getAuthorizationHeader();

      if (authorizationHeader) {
        if (config.headers?.set) {
          config.headers.set('Authorization', authorizationHeader);
        } else {
          // Fallback for older axios versions or custom headers object
          config.headers = axios.AxiosHeaders.from({
            ...(config.headers as any),
            Authorization: authorizationHeader,
          });
        }
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (__DEV__) {
      console.debug('[apiClient] response error:', {
        message: error?.message,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL || apiClient.defaults.baseURL,
        method: error?.config?.method,
      });
    }
    const isNetworkError = !error?.response;
    const isUnauthorized = error?.response?.status === 401;

    if (isUnauthorized || isNetworkError) {
      // ✅ Handle critical connectivity/auth failures
      const { Alert } = require('react-native');
      const { authService } = require('../services/authService');

      const { EVENT_NAMES, globalEvents } = require('../utils/GlobalEventEmitter');

      if (isUnauthorized) {
        globalEvents.emit(EVENT_NAMES.SHOW_CONFIRM, {
          title: 'Session Expired',
          message: 'Your session has expired. Please login again to continue.',
          confirmText: 'Login Again',
          cancelText: 'Dismiss',
          onConfirm: () => authService.signOut(),
          onCancel: () => authService.signOut()
        });
      } else {
        globalEvents.emit(EVENT_NAMES.SHOW_CONFIRM, {
          title: 'Connection Lost',
          message: 'Network connection lost. Please login again.',
          confirmText: 'Login Again',
          cancelText: 'Dismiss',
          onConfirm: () => authService.signOut(),
          onCancel: () => authService.signOut()
        });
      }
      return Promise.reject(error);
    }

    const config = error?.config as any;

    if (!isNetworkError || !config || config.__devFallbackTried || !__DEV__) {
      return Promise.reject(error);
    }

    config.__devFallbackTried = true;
    const currentBaseUrl = config.baseURL || apiClient.defaults.baseURL;
    const fallbackUrls = getDevApiBaseUrls().filter(url => url !== currentBaseUrl);

    for (const baseURL of fallbackUrls) {
      try {
        const response = await apiClient.request({
          ...config,
          baseURL,
          __devFallbackTried: true,
        });
        apiClient.defaults.baseURL = baseURL;
        return response;
      } catch (fallbackError: any) {
        if (fallbackError?.response) {
          return Promise.reject(fallbackError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
