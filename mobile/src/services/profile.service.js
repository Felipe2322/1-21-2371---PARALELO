/**
 * Servicio de Perfil
 * Capa: Services (MVVM)
 */
import apiClient from './api.service';

const ProfileService = {
  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile() {
    const response = await apiClient.get('/profile');
    return response.data.data.profile;
  },

  /**
   * Actualizar perfil
   */
  async updateProfile(data) {
    const response = await apiClient.put('/profile', data);
    return response.data.data.user;
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.put('/profile/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default ProfileService;
