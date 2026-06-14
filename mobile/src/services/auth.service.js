
import apiClient from './api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientLoginError = (error) => {
  const status = error.response?.status;
  return !status || status >= 500;
};

const AuthService = {

  async login(email, password) {
    let response;

    try {
      response = await apiClient.post('/auth/login', { email, password });
    } catch (error) {
      if (!isTransientLoginError(error)) {
        throw error;
      }

      await wait(700);
      response = await apiClient.post('/auth/login', { email, password });
    }

    const { user, token } = response.data.data;

    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));

    return { user, token };
  },

  
   
  async register(name, email, password, role = 'user') {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      role,
    });
    const { user, token } = response.data.data;

    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));

    return { user, token };
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data.data.user;
  },

  /**
   * Cerrar sesión
   */
  async logout() {
    await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
  },

  /**
   * Verificar si hay sesión activa
   */
  async isAuthenticated() {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },

  /**
   * Obtener usuario guardado localmente
   */
  async getStoredUser() {
    const userStr = await AsyncStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Obtener token almacenado
   */
  async getToken() {
    return AsyncStorage.getItem('auth_token');
  },
};

export default AuthService;
