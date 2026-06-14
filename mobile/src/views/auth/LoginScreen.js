import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/theme';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Correo no válido';
    if (!password) e.password = 'Ingresa tu contraseña';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Error al entrar', err.response?.data?.message || 'Revisa tus datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logo}>
            <Text style={s.logoText}>FC</Text>
          </View>
          <Text style={s.appName}>Felix Cabrera</Text>
          <Text style={s.appSub}>Panel móvil</Text>
        </View>

        <Text style={s.title}>Bienvenido</Text>
        <Text style={s.sub}>Inicia sesión para continuar</Text>

        {/* Form */}
        <View style={s.form}>
          <Text style={s.label}>Correo</Text>
          <TextInput
            style={[s.input, errors.email && s.inputErr]}
            value={email}
            onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: null })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.muted}
          />
          {errors.email ? <Text style={s.err}>{errors.email}</Text> : null}

          <Text style={[s.label, { marginTop: 16 }]}>Contraseña</Text>
          <TextInput
            style={[s.input, errors.password && s.inputErr]}
            value={password}
            onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: null })); }}
            secureTextEntry
            placeholderTextColor={colors.muted}
          />
          {errors.password ? <Text style={s.err}>{errors.password}</Text> : null}

          <TouchableOpacity
            style={[s.btn, loading && s.btnOff]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnText}>Entrar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={s.link} onPress={() => navigation.navigate('Register')}>
            <Text style={s.linkText}>Crear una cuenta nueva</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 32 },

  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 64, height: 64, borderRadius: 22,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#3B365B',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoText: { color: colors.primaryDark, fontSize: 22, fontWeight: '900' },
  appName:  { color: colors.ink, fontSize: 18, fontWeight: '800' },
  appSub:   { color: colors.muted, fontSize: 13, marginTop: 2 },

  title: { color: colors.ink, fontSize: 28, fontWeight: '800', letterSpacing: 0 },
  sub:   { color: colors.inkSoft, fontSize: 14, marginTop: 6, marginBottom: 28 },

  form: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  label: { color: colors.inkSoft, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.ink,
  },
  inputErr: { borderColor: colors.danger },
  err: { color: colors.danger, fontSize: 12, marginTop: 5 },

  btn: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnOff:  { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  link:     { alignItems: 'center', marginTop: 14 },
  linkText: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },
});

export default LoginScreen;
