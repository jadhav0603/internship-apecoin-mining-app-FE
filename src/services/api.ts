import axios from 'axios';
import auth from '@react-native-firebase/auth';

const API = axios.create({
  baseURL: 'http://10.0.2.2:5000/api',
});

API.interceptors.request.use(async config => {
  const user = auth().currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;