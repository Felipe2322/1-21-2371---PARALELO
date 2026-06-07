import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, shadow, type } from '../../styles/theme';

const fields = [
  { key: 'name', label: 'Nombre completo', placeholder: 'Felix Cabrera', keyboardType: 'default' },
  { key: 'email', label: 'Correo', placeholder: 'correo@ejemplo.com', keyboardType: 'email-address' },
  { key: 'password', label: 'Contrasena', placeholder: 'Minimo 6 caracteres', secure: true },
  { key: 'confirmPassword', label: 'Confirmar contrasena', placeholder: 'Repite la contrasena', secure: true },
];

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name || form.name.trim().length < 2) {
      nextErrors.name = 'Escribe el nombre completo';
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Ingresa un correo valido';
    }
    if (!form.password || form.password.length < 6) {
      nextErrors.password = 'Usa al menos 6 caracteres';
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Las contrasenas no coinciden';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
    } catch (err) {
      Alert.alert('No se pudo crear la cuenta', err.response?.data?.message || 'Intenta nuevamente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nueva cuenta</Text>
          <Text style={styles.subtitle}>Crea un acceso para usar el panel movil.</Text>
        </View>

        <View style={styles.form}>
          {fields.map(({ key, label, placeholder, keyboardType, secure }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={[styles.input, errors[key] && styles.inputError]}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                value={form[key]}
                onChangeText={(value) => updateField(key, value)}
                keyboardType={keyboardType}
                autoCapitalize={key === 'name' ? 'words' : 'none'}
                secureTextEntry={secure}
                autoCorrect={false}
              />
              {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryButtonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 20 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 16 },
  backButtonText: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },
  title: type.title,
  subtitle: { ...type.body, marginTop: 8 },
  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  inputGroup: { marginBottom: 14 },
  label: { ...type.label, marginBottom: 7 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 5 },
  primaryButton: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.65 },
  primaryButtonText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
});

export default RegisterScreen;
