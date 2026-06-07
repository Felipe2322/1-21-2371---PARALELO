
import { useState, useCallback } from 'react';
import AuthRepository from '../repositories/AuthRepository';
import { LoginDTO, CreateUserDTO } from '../models/User';

export const useAuthViewModel = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Iniciar sesión
   */
  const login = useCallback(async (email, password) => {
    const dto = new LoginDTO(email, password);
    const { isValid, errors } = dto.validate();

    if (!isValid) {
      setError(Object.values(errors)[0]);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthRepository.login(email, password);
      setUser(result.user);
      setToken(result.token);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Registrar usuario
   */
  const register = useCallback(async (name, email, password, role) => {
    const dto = new CreateUserDTO(name, email, password, role);
    const { isValid, errors } = dto.validate();

    if (!isValid) {
      setError(Object.values(errors)[0]);
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthRepository.register(name, email, password, role);
      setUser(result.user);
      setToken(result.token);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message || 'Error al registrar usuario';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await AuthRepository.logout();
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verificar sesión al iniciar la app
   */
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const authenticated = await AuthRepository.isAuthenticated();
      if (authenticated) {
        const storedUser = await AuthRepository.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      }
      return authenticated;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };
};
