/**
 * Servicio de Subida de Archivos
 * Capa: Services (MVVM)
 */
import apiClient, { BASE_URL } from './api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UploadService = {
  /**
   * Subir archivo mediante multipart/form-data
   * @param {Object} file - { uri, name, type }
   * @param {Function} onProgress - callback de progreso (0-100)
   */
  async uploadFile(file, onProgress) {
    const token = await AsyncStorage.getItem('auth_token');

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    });

    return response.data.data;
  },

  /**
   * Obtener archivos del usuario
   */
  async getFiles() {
    const response = await apiClient.get('/upload');
    return response.data.data.files;
  },

  /**
   * Eliminar archivo
   */
  async deleteFile(id) {
    const response = await apiClient.delete(`/upload/${id}`);
    return response.data;
  },
};

export default UploadService;
