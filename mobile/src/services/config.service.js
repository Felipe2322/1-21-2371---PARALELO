/**
 * Servicio de Configuración
 * Capa: Services (MVVM)
 */
import apiClient from './api.service';

const ConfigService = {
  /**
   * Obtener configuración de la aplicación
   */
  async getConfig() {
    const response = await apiClient.get('/config');
    return response.data.data.config;
  },
};

export default ConfigService;
