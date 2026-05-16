import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : __DEV__
    ? 'http://192.168.1.27:3000'
    : 'https://ton-backend-en-prod.com';

const getToken = () =>
  Platform.OS === 'web'
    ? Promise.resolve(localStorage.getItem('token'))
    : SecureStore.getItemAsync('token');

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
