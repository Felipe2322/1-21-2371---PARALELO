/**
 * Repositorio de Archivos
 * Capa: Repository (MVVM)
 */
import UploadService from '../services/upload.service';
import { FileUpload } from '../models/FileUpload';

class UploadRepository {
  /**
   * Subir archivo
   */
  async uploadFile(file, onProgress) {
    const data = await UploadService.uploadFile(file, onProgress);
    return new FileUpload(data);
  }

  /**
   * Obtener archivos del usuario
   */
  async getFiles() {
    const files = await UploadService.getFiles();
    return files.map((f) => new FileUpload(f));
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(id) {
    return UploadService.deleteFile(id);
  }
}

export default new UploadRepository();
