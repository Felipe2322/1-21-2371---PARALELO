
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IP de la PC en la red actual.
const BASE_URL = 'https://93qa9dr0p2.execute-api.us-east-1.amazonaws.com/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error al leer token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido: limpiar sesión
      await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL };
