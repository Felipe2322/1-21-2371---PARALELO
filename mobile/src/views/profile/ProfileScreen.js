import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import ProfileService from '../../services/profile.service';
import { colors, radius, shadow, type } from '../../styles/theme';

const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((item) => item[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'FC';

  const handleUpdateProfile = async () => {
    if (!form.name || form.name.trim().length < 2) {
      Alert.alert('Error', 'Escribe el nombre completo');
      return;
    }

    setIsLoading(true);
    try {
      const updated = await ProfileService.updateProfile({ name: form.name.trim() });
      updateUser(updated);
      setIsEditing(false);
      Alert.alert('Listo', 'Perfil actualizado');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo actualizar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current) {
      Alert.alert('Error', 'Ingresa tu contrasena actual');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      Alert.alert('Error', 'Usa al menos 6 caracteres');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      Alert.alert('Error', 'Las contrasenas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      await ProfileService.changePassword(passwordForm.current, passwordForm.newPass);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      setShowPasswordForm(false);
      Alert.alert('Listo', 'Contrasena actualizada');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo cambiar la contrasena');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesion', 'Quieres salir de la app?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{user?.name}</Text>
          <Text style={styles.subtitle}>{user?.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Datos personales</Text>
        <TouchableOpacity onPress={() => setIsEditing((value) => !value)}>
          <Text style={styles.linkText}>{isEditing ? 'Cancelar' : 'Editar'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nombre</Text>
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={form.name}
              onChangeText={(value) => setForm({ name: value })}
              autoCapitalize="words"
            />
          ) : (
            <Text style={styles.infoValue}>{user?.name}</Text>
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Correo</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        <View style={styles.infoRowLast}>
          <Text style={styles.infoLabel}>Estado</Text>
          <Text style={styles.activeText}>Activo</Text>
        </View>
      </View>

      {isEditing ? (
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Seguridad</Text>
        <TouchableOpacity onPress={() => setShowPasswordForm((value) => !value)}>
          <Text style={styles.linkText}>{showPasswordForm ? 'Cerrar' : 'Cambiar'}</Text>
        </TouchableOpacity>
      </View>

      {showPasswordForm ? (
        <View style={styles.panel}>
          {[
            { key: 'current', label: 'Contrasena actual' },
            { key: 'newPass', label: 'Nueva contrasena' },
            { key: 'confirm', label: 'Confirmar contrasena' },
          ].map(({ key, label }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput
                style={styles.input}
                value={passwordForm[key]}
                onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, [key]: value }))}
                secureTextEntry
              />
            </View>
          ))}
          <TouchableOpacity
            style={[styles.primaryButtonInside, isLoading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Actualizar contrasena</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.securityNote}>
          <Text style={styles.securityNoteText}>Mantener tu acceso actualizado ayuda a proteger la cuenta.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar sesion</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 18,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: colors.surface, fontSize: 20, fontWeight: '800' },
  headerInfo: { flex: 1 },
  title: { ...type.title, fontSize: 22, lineHeight: 27 },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 3 },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginTop: 8,
  },
  rolePillText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: type.section,
  linkText: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  panel: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadow,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    minHeight: 52,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  infoRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  infoLabel: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  infoValue: { flex: 1, textAlign: 'right', fontSize: 14, color: colors.ink, fontWeight: '700' },
  activeText: { fontSize: 14, color: colors.success, fontWeight: '800' },
  infoInput: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    textAlign: 'right',
    color: colors.ink,
  },
  primaryButton: {
    marginHorizontal: 16,
    marginTop: 12,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonInside: {
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 14,
    marginTop: 2,
  },
  buttonDisabled: { opacity: 0.65 },
  primaryButtonText: { color: colors.surface, fontSize: 14, fontWeight: '800' },
  inputGroup: { padding: 14, paddingBottom: 8 },
  inputLabel: { ...type.label, marginBottom: 7 },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.ink,
  },
  securityNote: {
    marginHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 14,
  },
  securityNoteText: { ...type.body },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 22,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F7B4AE',
  },
  logoutButtonText: { color: colors.danger, fontSize: 15, fontWeight: '800' },
  bottomSpace: { height: 32 },
});

export default ProfileScreen;
