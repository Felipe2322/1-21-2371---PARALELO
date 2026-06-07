/**
 * Modelo de FileUpload - Entidad
 * Capa: Models (MVVM)
 */

export class FileUpload {
  constructor(data = {}) {
    this.id = data.id || null;
    this.originalName = data.originalName || '';
    this.filename = data.filename || '';
    this.mimetype = data.mimetype || '';
    this.size = data.size || 0;
    this.url = data.url || '';
    this.uploadedBy = data.uploadedBy || null;
    this.uploadedAt = data.uploadedAt ? new Date(data.uploadedAt) : null;
  }

  get isImage() {
    return this.mimetype.startsWith('image/');
  }

  get isPDF() {
    return this.mimetype === 'application/pdf';
  }

  get sizeFormatted() {
    if (this.size < 1024) return `${this.size} B`;
    if (this.size < 1024 * 1024) return `${(this.size / 1024).toFixed(1)} KB`;
    return `${(this.size / (1024 * 1024)).toFixed(1)} MB`;
  }
}

// DTO para subida de archivo
export class UploadFileDTO {
  constructor(uri, name, type) {
    this.uri = uri;
    this.name = name;
    this.type = type;
  }

  toFormData() {
    const formData = new FormData();
    formData.append('file', {
      uri: this.uri,
      name: this.name,
      type: this.type,
    });
    return formData;
  }
}
