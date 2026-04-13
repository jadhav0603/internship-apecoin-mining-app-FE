import axios from 'axios';
import { API_CONFIG } from './config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default apiClient;
