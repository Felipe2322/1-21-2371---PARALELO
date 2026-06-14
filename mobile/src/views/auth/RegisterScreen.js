import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, shadow } from '../../styles/theme';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Nombre muy corto';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo no válido';
    if (!form.password || form.password.length < 6) e.password = 'Mínimo 6 caracteres';
    if (form.password !== form.confirm) e.confirm = 'Las contraseñas no coinciden';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ k, label, secure, keyboard }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, errors[k] && s.inputErr]}
        value={form[k]}
        onChangeText={v => set(k, v)}
        secureTextEntry={secure}
        keyboardType={keyboard}
        autoCapitalize={k === 'name' ? 'words' : 'none'}
        autoCorrect={false}
        placeholderTextColor={colors.muted}
      />
      {errors[k] ? <Text style={s.err}>{errors[k]}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={s.title}>Nueva cuenta</Text>
        <Text style={s.sub}>Completa los datos para registrarte</Text>

        <View style={s.form}>
          <Field k="name"     label="Nombre"              keyboard="default" />
          <Field k="email"    label="Correo"              keyboard="email-address" />
          <Field k="password" label="Contraseña"          secure />
          <Field k="confirm"  label="Confirmar contraseña" secure />

          <TouchableOpacity
            style={[s.btn, loading && s.btnOff]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Crear cuenta</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },

  back:     { marginBottom: 24 },
  backText: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },

  title: { color: colors.ink, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  sub:   { color: colors.inkSoft, fontSize: 14, marginTop: 6, marginBottom: 28 },

  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  label: { color: colors.inkSoft, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.ink,
  },
  inputErr: { borderColor: colors.danger },
  err: { color: colors.danger, fontSize: 12, marginTop: 5 },

  btn:    { marginTop: 8, backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 15, alignItems: 'center' },
  btnOff: { opacity: 0.6 },
  btnText:{ color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default RegisterScreen;
