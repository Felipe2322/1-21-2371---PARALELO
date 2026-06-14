import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { useUploadViewModel } from '../../viewmodels/UploadViewModel';
import { colors, radius, type } from '../../styles/theme';

const ProgressBar = ({ progress }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${progress}%` }]} />
    </View>
    <Text style={styles.progressText}>{progress}%</Text>
  </View>
);

const FileMark = ({ file }) => {
  if (file.isImage) {
    return <Image source={{ uri: file.url }} style={styles.fileThumb} />;
  }

  return (
    <View style={styles.fileMark}>
      <Text style={styles.fileMarkText}>{file.isPDF ? 'PDF' : 'DOC'}</Text>
    </View>
  );
};

const FileItem = ({ file, onOpen, onDelete }) => (
  <View style={styles.fileItem}>
    <FileMark file={file} />
    <View style={styles.fileInfo}>
      <Text style={styles.fileName} numberOfLines={1}>
        {file.originalName}
      </Text>
      <Text style={styles.fileDetail}>
        {file.sizeFormatted} - {file.mimetype || 'archivo'}
      </Text>
    </View>
    <View style={styles.fileActions}>
      <TouchableOpacity style={styles.openButton} onPress={() => onOpen(file)}>
        <Text style={styles.openButtonText}>Abrir</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(file.id)}>
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const UploadScreen = () => {
  const {
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
  } = useUploadViewModel();

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert('Listo', successMessage);
      clearMessages();
    }
  }, [successMessage, clearMessages]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearMessages();
    }
  }, [error, clearMessages]);

  const handleDelete = (id) => {
    Alert.alert('Eliminar archivo', 'Quieres eliminar este archivo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteFile(id) },
    ]);
  };

  const handleOpenFile = async (file) => {
    if (!file.url) {
      Alert.alert('Archivo sin URL', 'La API no devolvio una direccion para este archivo.');
      return;
    }

    const supported = await Linking.canOpenURL(file.url);
    if (!supported) {
      Alert.alert('No se pudo abrir', 'El telefono no puede abrir este enlace.');
      return;
    }

    await Linking.openURL(file.url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Archivos</Text>
        <Text style={styles.subtitle}>Sube imagenes, fotos o documentos del usuario</Text>
      </View>

      <View style={styles.pickerPanel}>
        <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
          <Text style={styles.pickLabel}>Galeria</Text>
          <Text style={styles.pickHint}>Imagen guardada</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickButton} onPress={takePhoto}>
          <Text style={styles.pickLabel}>Camara</Text>
          <Text style={styles.pickHint}>Nueva foto</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pickButton} onPress={pickDocument}>
          <Text style={styles.pickLabel}>Documento</Text>
          <Text style={styles.pickHint}>PDF o Word</Text>
        </TouchableOpacity>
      </View>

      {selectedFile ? (
        <View style={styles.previewPanel}>
          <Text style={styles.sectionTitle}>Archivo seleccionado</Text>
          {selectedFile.isImage ? (
            <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.previewDoc}>
              <Text style={styles.previewDocText}>DOCUMENTO</Text>
            </View>
          )}

          <Text style={styles.previewName} numberOfLines={1}>
            {selectedFile.name}
          </Text>
          <Text style={styles.previewDetail}>
            {selectedFile.type || 'archivo'}
            {selectedFile.size ? ` - ${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
          </Text>

          {isUploading ? <ProgressBar progress={uploadProgress} /> : null}

          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.uploadButton, isUploading && styles.buttonDisabled]}
              onPress={uploadFile}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color={colors.surface} size="small" />
              ) : (
                <Text style={styles.uploadButtonText}>Subir archivo</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSelectedFile(null)}
              disabled={isUploading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Subidos</Text>
        <Text style={styles.sectionMeta}>{files.length} archivos</Text>
      </View>

      <View style={styles.filePanel}>
        {isLoading && files.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : files.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin archivos</Text>
            <Text style={styles.emptyText}>Los archivos que subas se veran aqui.</Text>
          </View>
        ) : (
          files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onOpen={handleOpenFile}
              onDelete={handleDelete}
            />
          ))
        )}
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
  },
  title: type.title,
  subtitle: { ...type.body, marginTop: 4 },
  pickerPanel: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  pickButton: {
    flex: 1,
    minHeight: 88,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    justifyContent: 'space-between',
  },
  pickLabel: { fontSize: 14, color: colors.ink, fontWeight: '800' },
  pickHint: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  previewPanel: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
  },
  previewImage: {
    width: '100%',
    height: 190,
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 12,
  },
  previewDoc: {
    minHeight: 120,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  previewDocText: { color: colors.inkSoft, fontWeight: '800', letterSpacing: 1 },
  previewName: { fontSize: 15, color: colors.ink, fontWeight: '800' },
  previewDetail: { fontSize: 12, color: colors.muted, marginTop: 3 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 10 },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.line,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressText: { width: 40, fontSize: 12, color: colors.primaryDark, fontWeight: '800' },
  previewActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  uploadButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.65 },
  uploadButtonText: { color: colors.surface, fontSize: 14, fontWeight: '800' },
  cancelButton: {
    minWidth: 94,
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: { color: colors.inkSoft, fontSize: 14, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: type.section,
  sectionMeta: { fontSize: 12, color: colors.muted, fontWeight: '700' },
  filePanel: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  fileThumb: { width: 48, height: 48, borderRadius: radius.md, marginRight: 12 },
  fileMark: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileMarkText: { color: colors.inkSoft, fontSize: 12, fontWeight: '800' },
  fileInfo: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 14, color: colors.ink, fontWeight: '800' },
  fileDetail: { fontSize: 12, color: colors.muted, marginTop: 3 },
  fileActions: {
    alignItems: 'flex-end',
    gap: 7,
    marginLeft: 8,
  },
  openButton: {
    minWidth: 68,
    minHeight: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButtonText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  deleteButton: {
    minWidth: 68,
    minHeight: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: { color: colors.danger, fontSize: 12, fontWeight: '800' },
  loader: { padding: 22 },
  empty: { padding: 28, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  emptyText: { fontSize: 13, color: colors.muted, marginTop: 6, textAlign: 'center' },
  bottomSpace: { height: 112 },
});

export default UploadScreen;
