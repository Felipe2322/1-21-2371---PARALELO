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
} from 'react-native';
import { colors, radius, shadow, type } from '../../styles/theme';
import apiClient from '../../services/api.service';

const NotificationScreen = () => {
  const [email,   setEmail]   = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [status,    setStatus]    = useState(null); // 'success' | 'error'
  const [feedback,  setFeedback]  = useState('');

  const handleSend = async () => {
    // Validación básica
    if (!email.trim() || !subject.trim() || !message.trim()) {
      setStatus('error');
      setFeedback('Por favor completá todos los campos.');
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
      const response = await apiClient.post('/notifications/send', {
        email:   email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (response.data.success) {
        setStatus('success');
        setFeedback('Mensaje enviado correctamente.');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setStatus('error');
        setFeedback(response.data.message || 'Error al enviar mensaje.');
      }
    } catch (error) {
      setStatus('error');
      setFeedback(
        error.response?.data?.message || 'Error al enviar mensaje.'
      );
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
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>AWS SNS + SES</Text>
          <Text style={styles.title}>Enviar Notificación</Text>
        </View>

        {/* Flujo informativo */}
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>Flujo de envío</Text>
          <View style={styles.flowRow}>
            {['App', 'Backend', 'SNS', 'SQS', 'Lambda', 'Email'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <View style={styles.flowStep}>
                  <Text style={styles.flowStepText}>{step}</Text>
                </View>
                {i < arr.length - 1 && (
                  <Text style={styles.flowArrow}>→</Text>
                )}
              </React.Fragment>
            ))}
          </View>
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
              {status === 'success' ? '✅ ' : '❌ '}{feedback}
            </Text>
          </View>
        ) : null}

        {/* Formulario */}
        <View style={styles.form}>
          <Text style={styles.label}>Correo destino</Text>
          <TextInput
            style={styles.input}
            placeholder="usuario@correo.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Asunto</Text>
          <TextInput
            style={styles.input}
            placeholder="Prueba SNS"
            placeholderTextColor={colors.muted}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Mensaje</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Hola desde AWS Serverless"
            placeholderTextColor={colors.muted}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={styles.buttonText}>Enviar Notificación</Text>
            )}
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
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
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
  flowCard: {
    margin: 16,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  flowTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  flowStep: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  flowStepText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  flowArrow: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '700',
  },
  feedback: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: radius.md,
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
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackTextSuccess: { color: colors.success },
  feedbackTextError:   { color: colors.danger },
  form: {
    margin: 16,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkSoft,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
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
  button: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
});

export default NotificationScreen;
