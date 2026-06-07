/**
 * Modelo de configuración de la aplicación
 * Capa: Models (MVVM)
 */

export class AppConfig {
  constructor(data = {}) {
    this.appName = data.appName || '';
    this.version = data.version || '';
    this.features = data.features || {};
    this.pagination = data.pagination || { defaultLimit: 10 };
    this.maintenance = data.maintenance || false;
    this.lastUpdated = data.lastUpdated ? new Date(data.lastUpdated) : null;
  }
}
