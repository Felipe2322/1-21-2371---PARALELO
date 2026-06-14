import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useUserViewModel } from '../../viewmodels/UserViewModel';
import { colors, type } from '../../styles/theme';

const UserFormScreen = ({ route, navigation }) => {
  const { user } = route.params || {};
  const isEditing = !!user;
  const { createUser, updateUser, isLoading, error, successMessage, clearMessages } = useUserViewModel();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'user',
    isActive: user?.isActive !== undefined ? user.isActive : true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar usuario' : 'Nuevo usuario' });
  }, [isEditing, navigation]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert('Listo', successMessage, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      clearMessages();
    }
  }, [successMessage, clearMessages, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearMessages();
    }
  }, [error, clearMessages]);

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
    if (!isEditing && (!form.password || form.password.length < 6)) {
      nextErrors.password = 'Usa al menos 6 caracteres';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (isEditing) {
      const data = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        isActive: form.isActive,
      };
      if (form.password) data.password = form.password;
      await updateUser(user.id, data);
    } else {
      await createUser(
        form.name.trim(),
        form.email.trim().toLowerCase(),
        form.password,
        form.role
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.title}>{isEditing ? 'Datos del usuario' : 'Crear acceso'}</Text>
          <Text style={styles.subtitle}>
            {isEditing ? 'Actualiza datos, rol y estado.' : 'Agrega un usuario al panel.'}
          </Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Felix Cabrera"
              placeholderTextColor={colors.muted}
              value={form.name}
              onChangeText={(value) => updateField('name', value)}
              autoCapitalize="words"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.muted}
              value={form.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {isEditing ? 'Nueva contrasena (opcional)' : 'Contrasena'}
            </Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder={isEditing ? 'Dejar vacio para conservarla' : 'Minimo 6 caracteres'}
              placeholderTextColor={colors.muted}
              value={form.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rol</Text>
            <View style={styles.segmented}>
              {['user', 'admin'].map((role) => {
                const selected = form.role === role;
                return (
                  <TouchableOpacity
                    key={role}
                    style={[styles.segment, selected && styles.segmentSelected]}
                    onPress={() => updateField('role', role)}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                      {role === 'admin' ? 'Administrador' : 'Usuario'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {isEditing ? (
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.label}>Cuenta activa</Text>
                <Text style={styles.switchHint}>Permite o bloquea el acceso.</Text>
              </View>
              <Switch
                value={form.isActive}
                onValueChange={(value) => updateField('isActive', value)}
                trackColor={{ false: colors.line, true: colors.primarySoft }}
                thumbColor={form.isActive ? colors.primary : colors.muted}
              />
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Guardar cambios' : 'Crear usuario'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 112 },
  intro: { marginBottom: 16 },
  title: { ...type.title, fontSize: 24 },
  subtitle: { ...type.body, marginTop: 5 },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
  },
  inputGroup: { marginBottom: 15 },
  label: { ...type.label, marginBottom: 7 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 5 },
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: { backgroundColor: colors.primarySoft },
  segmentText: { color: colors.inkSoft, fontSize: 13, fontWeight: '800' },
  segmentTextSelected: { color: colors.primaryDark },
  switchRow: {
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 14,
  },
  switchHint: { color: colors.muted, fontSize: 12 },
  submitButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.65 },
  submitButtonText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  cancelButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  cancelButtonText: { color: colors.inkSoft, fontSize: 14, fontWeight: '700' },
});

export default UserFormScreen;
