/**
 * ViewModel de Usuarios - CRUD completo
 * Capa: ViewModel (MVVM)
 */
import { useState, useCallback } from 'react';
import UserRepository from '../repositories/UserRepository';
import { CreateUserDTO, UpdateUserDTO } from '../models/User';

export const useUserViewModel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  /**
   * Obtener lista de usuarios
   */
  const fetchUsers = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await UserRepository.getUsers(params);
      setUsers(result.users);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener usuario por ID
   */
  const fetchUserById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await UserRepository.getUserById(id);
      setSelectedUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuario');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crear usuario
   */
  const createUser = useCallback(async (name, email, password, role) => {
    const dto = new CreateUserDTO(name, email, password, role);
    const { isValid, errors } = dto.validate();

    if (!isValid) {
      setError(Object.values(errors)[0]);
      return false;
    }

    setIsLoading(true);
    setError(null);
    try {
      const newUser = await UserRepository.createUser(dto);
      setUsers((prev) => [newUser, ...prev]);
      setSuccessMessage('Usuario creado exitosamente');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear usuario');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualizar usuario
   */
  const updateUser = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const dto = new UpdateUserDTO(data);
      const updated = await UserRepository.updateUser(id, dto);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setSelectedUser(updated);
      setSuccessMessage('Usuario actualizado exitosamente');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Eliminar usuario
   */
  const deleteUser = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await UserRepository.deleteUser(id);
      // Eliminar el usuario del estado local inmediatamente
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccessMessage('Usuario eliminado exitosamente');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    selectedUser,
    pagination,
    isLoading,
    error,
    successMessage,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    clearMessages,
    setSelectedUser,
  };
};
