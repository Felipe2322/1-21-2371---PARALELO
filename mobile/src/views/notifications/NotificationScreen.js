import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { colors } from '../../styles/theme';
import apiClient from '../../services/api.service';

const NotificationScreen = () => {
  const [email,   setEmail]   = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [image,   setImage]   = useState(null); // { uri, base64, name }

  const [isLoading, setIsLoading] = useState(false);
  const [status,    setStatus]    = useState(null);
  const [feedback,  setFeedback]  = useState('');

  const pickImage = async () => {
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== 'granted') {
      setStatus('error');
      setFeedback('Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() || 'jpg';
      const base64 = asset.base64 || await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setImage({
        uri:    asset.uri,
        base64,
        name:   `imagen.${ext}`,
        type:   asset.mimeType || `image/${ext}`,
      });
    }
  };

  const removeImage = () => setImage(null);

  const handleSend = async () => {
    if (!email.trim() || !subject.trim() || !message.trim()) {
      setStatus('error');
      setFeedback('Completá todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus('error');
      setFeedback('El formato del correo no es válido.');
      return;
    }

    setIsLoading(true);
    setStatus(null);
    setFeedback('');

    try {
      const body = {
        email:   email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      };

      if (image && !image.base64) {
        setStatus('error');
        setFeedback('No se pudo preparar la imagen adjunta.');
        return;
      }

      if (image?.base64) {
        body.image = {
          data:     image.base64,
          name:     image.name,
          mimeType: image.type,
        };
      }

      const response = await apiClient.post('/notifications/send', body);

      if (response.data.success) {
        setStatus('success');
        setFeedback('Mensaje enviado correctamente.');
        setEmail('');
        setSubject('');
        setMessage('');
        setImage(null);
      } else {
        setStatus('error');
        setFeedback(response.data.message || 'Error al enviar mensaje.');
      }
    } catch (error) {
      setStatus('error');
      setFeedback(error.response?.data?.message || 'Error al enviar mensaje.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 112 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>Notificaciones</Text>
          <Text style={styles.title}>Enviar correo</Text>
        </View>

        {/* Feedback */}
        {status ? (
          <View style={[
            styles.feedback,
            status === 'success' ? styles.feedbackSuccess : styles.feedbackError,
          ]}>
            <Text style={[
              styles.feedbackText,
              status === 'success' ? styles.feedbackTextSuccess : styles.feedbackTextError,
            ]}>
              {feedback}
            </Text>
          </View>
        ) : null}

        {/* Formulario */}
        <View style={styles.form}>

          <Text style={styles.label}>Para</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Asunto</Text>
          <TextInput
            style={styles.input}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Mensaje</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* Imagen adjunta */}
          <Text style={styles.label}>Imagen adjunta</Text>

          {image ? (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage}>
                <Text style={styles.removeImageText}>Quitar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage} activeOpacity={0.8}>
              <Text style={styles.pickImageText}>Adjuntar imagen</Text>
            </TouchableOpacity>
          )}

          {/* Botón enviar */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={colors.surface} size="small" />
              : <Text style={styles.buttonText}>Enviar</Text>
            }
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
  },
  kicker: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 4,
  },
  feedback: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: '#86EFAC',
  },
  feedbackError: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#F7B4AE',
  },
  feedbackText: { fontSize: 14, fontWeight: '600' },
  feedbackTextSuccess: { color: colors.success },
  feedbackTextError:   { color: colors.danger },
  form: {
    margin: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkSoft,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.background,
  },
  inputMultiline: {
    minHeight: 110,
    paddingTop: 10,
  },
  pickImageBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    borderStyle: 'dashed',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  pickImageText: {
    fontSize: 14,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  imagePreviewWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  removeImageBtn: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
  },
  removeImageText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  button: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
});

export default NotificationScreen;
