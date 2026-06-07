/**
 * Servicio de Usuarios - HTTP requests
 * Capa: Services (MVVM)
 */
import apiClient from './api.service';

const UserService = {
  /**
   * Obtener lista de usuarios con paginación y filtros
   */
  async getUsers(params = {}) {
    const response = await apiClient.get('/users', { params });
    return response.data.data;
  },

  /**
   * Obtener usuario por ID
   */
  async getUserById(id) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data.user;
  },

  /**
   * Crear nuevo usuario
   */
  async createUser(userData) {
    const response = await apiClient.post('/users', userData);
    return response.data.data.user;
  },

  /**
   * Actualizar usuario
   */
  async updateUser(id, userData) {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data.data.user;
  },

  /**
   * Dar de baja usuario (soft delete)
   */
  async deleteUser(id) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data.data.user;
  },
};

export default UserService;
