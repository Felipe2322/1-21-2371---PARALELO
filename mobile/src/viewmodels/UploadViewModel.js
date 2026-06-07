/**
 * ViewModel de Subida de Archivos
 * Capa: ViewModel (MVVM)
 */
import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import UploadRepository from '../repositories/UploadRepository';

export const useUploadViewModel = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  /**
   * Seleccionar imagen de la galería
   */
  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Se necesita permiso para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
        size: asset.fileSize,
        isImage: true,
      });
    }
  }, []);

  /**
   * Tomar foto con la cámara
   */
  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Se necesita permiso para acceder a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
        isImage: true,
      });
    }
  }, []);

  /**
   * Seleccionar documento
   */
  const pickDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword',
             'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/pdf',
        size: asset.size,
        isImage: false,
      });
    }
  }, []);

  /**
   * Subir archivo seleccionado
   */
  const uploadFile = useCallback(async () => {
    if (!selectedFile) {
      setError('Selecciona un archivo primero');
      return false;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploaded = await UploadRepository.uploadFile(
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      setFiles((prev) => [uploaded, ...prev]);
      setSelectedFile(null);
      setUploadProgress(100);
      setSuccessMessage('Archivo subido exitosamente');
      return uploaded;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir el archivo');
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile]);

  /**
   * Cargar archivos del usuario
   */
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await UploadRepository.getFiles();
      setFiles(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar archivos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Eliminar archivo
   */
  const deleteFile = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await UploadRepository.deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setSuccessMessage('Archivo eliminado');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar archivo');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    files,
    selectedFile,
    uploadProgress,
    isUploading,
    isLoading,
    error,
    successMessage,
    pickImage,
    takePhoto,
    pickDocument,
    uploadFile,
    fetchFiles,
    deleteFile,
    clearMessages,
    setSelectedFile,
  };
};
