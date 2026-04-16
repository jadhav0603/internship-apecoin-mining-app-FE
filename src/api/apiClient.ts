import axios from 'axios';
import { API_CONFIG, getDevApiBaseUrls } from './config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helpful debug: show which baseURL we're using in dev builds
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.debug('[apiClient] baseURL:', apiClient.defaults.baseURL);
}
// You can add interceptors here (e.g., for attaching auth tokens)
apiClient.interceptors.request.use(
  (config) => {
    // Add logic before request is sent
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.debug('[apiClient] response error:', {
        message: error?.message,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL || apiClient.defaults.baseURL,
        method: error?.config?.method,
      });
    }
    const isNetworkError = !error?.response;
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
