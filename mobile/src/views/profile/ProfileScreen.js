import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import ProfileService from '../../services/profile.service';
import { colors, radius, shadow } from '../../styles/theme';

const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuth();
  const [editing,  setEditing]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [name,     setName]     = useState(user?.name || '');
  const [pwForm,   setPwForm]   = useState({ cur: '', next: '', conf: '' });
  const [showPw,   setShowPw]   = useState(false);

  const initials = (user?.name?.split(' ').map(w => w[0]).join('') || 'FC').toUpperCase().slice(0, 2);

  const saveProfile = async () => {
    if (!name.trim() || name.trim().length < 2) { Alert.alert('Error', 'Nombre muy corto'); return; }
    setLoading(true);
    try {
      const updated = await ProfileService.updateProfile({ name: name.trim() });
      updateUser(updated);
      setEditing(false);
    } catch (e) { Alert.alert('Error', e.response?.data?.message || 'No se pudo actualizar'); }
    finally { setLoading(false); }
  };

  const savePassword = async () => {
    if (!pwForm.cur)               { Alert.alert('Error', 'Ingresa tu contraseña actual'); return; }
    if (pwForm.next.length < 6)    { Alert.alert('Error', 'Mínimo 6 caracteres'); return; }
    if (pwForm.next !== pwForm.conf){ Alert.alert('Error', 'Las contraseñas no coinciden'); return; }
    setLoading(true);
    try {
      await ProfileService.changePassword(pwForm.cur, pwForm.next);
      setPwForm({ cur: '', next: '', conf: '' });
      setShowPw(false);
      Alert.alert('Listo', 'Contraseña actualizada');
    } catch (e) { Alert.alert('Error', e.response?.data?.message || 'No se pudo cambiar'); }
    finally { setLoading(false); }
  };

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={s.root}>

      {/* Header */}
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{initials}</Text>
        </View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.pill}>
          <Text style={s.pillTxt}>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</Text>
        </View>
      </View>

      {/* Datos */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionLabel}>Datos</Text>
          <TouchableOpacity onPress={() => setEditing(v => !v)}>
            <Text style={s.link}>{editing ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.rowKey}>Nombre</Text>
            {editing
              ? <TextInput style={s.inlineInput} value={name} onChangeText={setName} autoCapitalize="words" />
              : <Text style={s.rowVal}>{user?.name}</Text>
            }
          </View>
          <View style={s.row}>
            <Text style={s.rowKey}>Correo</Text>
            <Text style={s.rowVal}>{user?.email}</Text>
          </View>
          <View style={[s.row, { borderBottomWidth: 0 }]}>
            <Text style={s.rowKey}>Estado</Text>
            <Text style={[s.rowVal, { color: colors.success }]}>Activo</Text>
          </View>
        </View>
        {editing && (
          <TouchableOpacity style={[s.btn, loading && s.btnOff]} onPress={saveProfile} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnTxt}>Guardar</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Seguridad */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <Text style={s.sectionLabel}>Seguridad</Text>
          <TouchableOpacity onPress={() => setShowPw(v => !v)}>
            <Text style={s.link}>{showPw ? 'Cerrar' : 'Cambiar contraseña'}</Text>
          </TouchableOpacity>
        </View>

        {showPw && (
          <View style={s.card}>
            {[['cur','Contraseña actual'],['next','Nueva contraseña'],['conf','Confirmar']].map(([k,l]) => (
              <View key={k} style={s.inputGroup}>
                <Text style={s.inputLabel}>{l}</Text>
                <TextInput
                  style={s.input}
                  value={pwForm[k]}
                  onChangeText={v => setPwForm(p => ({ ...p, [k]: v }))}
                  secureTextEntry
                  placeholderTextColor={colors.muted}
                />
              </View>
            ))}
            <TouchableOpacity style={[s.btn, s.btnInside, loading && s.btnOff]} onPress={savePassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnTxt}>Actualizar contraseña</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout}>
        <Text style={s.logoutTxt}>Cerrar sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: { alignItems: 'center', paddingTop: 52, paddingBottom: 24, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line },
  avatar:    { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTxt: { color: '#fff', fontSize: 24, fontWeight: '900' },
  name:      { color: colors.ink, fontSize: 20, fontWeight: '800' },
  email:     { color: colors.muted, fontSize: 13, marginTop: 4 },
  pill:      { backgroundColor: colors.primarySoft, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 10 },
  pillTxt:   { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },

  section:     { paddingHorizontal: 16, marginTop: 24 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel:{ color: colors.inkSoft, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  link:        { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },

  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', ...shadow },

  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowKey:      { color: colors.inkSoft, fontSize: 13 },
  rowVal:      { color: colors.ink, fontSize: 14, fontWeight: '700' },
  inlineInput: { flex: 1, textAlign: 'right', color: colors.ink, fontSize: 14, backgroundColor: colors.surfaceMuted, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.line },

  inputGroup: { paddingHorizontal: 14, paddingTop: 14 },
  inputLabel: { color: colors.inkSoft, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 },
  input:      { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.ink },

  btn:      { marginTop: 14, backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center' },
  btnInside:{ margin: 14, marginTop: 14 },
  btnOff:   { opacity: 0.6 },
  btnTxt:   { color: '#fff', fontSize: 14, fontWeight: '800' },

  logoutBtn: { margin: 16, marginTop: 8, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger + '50' },
  logoutTxt: { color: colors.danger, fontSize: 15, fontWeight: '800' },
});

export default ProfileScreen;
