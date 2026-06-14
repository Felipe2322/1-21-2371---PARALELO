import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useDashboardViewModel } from '../../viewmodels/DashboardViewModel';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, shadow } from '../../styles/theme';

const Chip = ({ label, value, color }) => (
  <View style={[s.chip, { borderColor: color + '40' }]}>
    <View style={[s.chipDot, { backgroundColor: color }]} />
    <View>
      <Text style={[s.chipVal, { color }]}>{value}</Text>
      <Text style={s.chipLabel}>{label}</Text>
    </View>
  </View>
);

const UserRow = ({ user }) => (
  <View style={s.userRow}>
    <View style={[s.uAvatar, { backgroundColor: user.role === 'admin' ? colors.primarySoft : colors.blueSoft }]}>
      <Text style={[s.uAvatarTxt, { color: user.role === 'admin' ? colors.primaryDark : colors.blue }]}>
        {(user.initials || 'US').slice(0, 2)}
      </Text>
    </View>
    <View style={s.uMeta}>
      <Text style={s.uName}>{user.name}</Text>
      <Text style={s.uEmail}>{user.email}</Text>
    </View>
    <View style={[s.badge, user.role === 'admin' ? s.badgeAdmin : s.badgeUser]}>
      <Text style={[s.badgeTxt, { color: user.role === 'admin' ? colors.primaryDark : colors.blue }]}>
        {user.role === 'admin' ? 'Admin' : 'User'}
      </Text>
    </View>
  </View>
);

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { dashboardData, isLoading, error, loadTime, loadDashboard } = useDashboardViewModel();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadDashboard({ includeUsers: isAdmin });
  }, [isAdmin, loadDashboard]);

  if (isLoading && !dashboardData) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingTxt}>Cargando...</Text>
      </View>
    );
  }

  const initials = (user?.name?.split(' ').map(w => w[0]).join('') || 'FC').toUpperCase().slice(0, 2);

  return (
    <ScrollView
      style={s.root}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => loadDashboard({ includeUsers: isAdmin })}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.headerAvatar}>
            <Text style={s.headerAvatarTxt}>{initials}</Text>
          </View>
          <View>
            <Text style={s.greeting}>Hola, {user?.name?.split(' ')[0] || 'Felix'}</Text>
            <Text style={s.role}>{isAdmin ? 'Administrador' : 'Usuario'}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.exitBtn} onPress={logout}>
          <Text style={s.exitTxt}>Salir</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={s.errorBox}>
          <Text style={s.errorTxt}>{error}</Text>
        </View>
      ) : null}

      {dashboardData ? (
        <>
          {/* Stats */}
          <View style={s.chips}>
            {isAdmin && (
              <Chip label="Usuarios" value={dashboardData.totalUsers} color={colors.primary} />
            )}
            <Chip label="Archivos"  value={dashboardData.files.length}          color={colors.blue} />
            <Chip label="Versión"   value={dashboardData.config.version || '-'} color={colors.amber} />
            <Chip
              label="Estado"
              value={dashboardData.config.maintenance ? 'Mant.' : 'OK'}
              color={dashboardData.config.maintenance ? colors.amber : colors.success}
            />
          </View>

          {/* Perfil */}
          <Text style={s.sectionTitle}>Mi cuenta</Text>
          <View style={s.card}>
            <View style={s.profileRow}>
              <View style={s.profileAvatar}>
                <Text style={s.profileAvatarTxt}>{initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.profileName}>{dashboardData.profile.name}</Text>
                <Text style={s.profileEmail}>{dashboardData.profile.email}</Text>
                {loadTime ? <Text style={s.meta}>Cargado en {loadTime}ms</Text> : null}
              </View>
            </View>
          </View>

          {/* Usuarios recientes (solo admin) */}
          {isAdmin ? (
            <>
              <View style={s.sectionRow}>
                <Text style={s.sectionTitle}>Usuarios recientes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Users')}>
                  <Text style={s.link}>Ver todos</Text>
                </TouchableOpacity>
              </View>
              <View style={s.card}>
                {dashboardData.users.length === 0
                  ? <Text style={s.empty}>Sin usuarios aún</Text>
                  : dashboardData.users.map(u => <UserRow key={u.id} user={u} />)
                }
              </View>
            </>
          ) : null}

          {/* Info servicio */}
          <Text style={s.sectionTitle}>Servicio</Text>
          <View style={s.card}>
            {[
              ['API',            dashboardData.config.appName],
              ['File upload',    dashboardData.config.features?.fileUpload ? 'Activo' : 'Inactivo'],
              ['Tamaño máximo',  dashboardData.config.features?.maxFileSize || '-'],
            ].map(([k, v], i, arr) => (
              <View key={k} style={[s.row, i < arr.length - 1 && s.rowBorder]}>
                <Text style={s.rowKey}>{k}</Text>
                <Text style={s.rowVal}>{v}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.background },
  centered:{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingTxt: { color: colors.inkSoft, marginTop: 12, fontSize: 14 },

  header: {
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar:    { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  headerAvatarTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  greeting:        { color: colors.ink, fontSize: 17, fontWeight: '800' },
  role:            { color: colors.muted, fontSize: 12, marginTop: 2 },
  exitBtn:         { backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.line },
  exitTxt:         { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },

  errorBox:{ margin: 16, padding: 12, borderRadius: radius.sm, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger + '40' },
  errorTxt:{ color: colors.danger, fontSize: 13 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  chip:  {
    flex: 1, minWidth: '44%', backgroundColor: colors.surface,
    borderRadius: radius.md, borderWidth: 1,
    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, ...shadow,
  },
  chipDot:   { width: 8, height: 8, borderRadius: 4 },
  chipVal:   { fontSize: 20, fontWeight: '800' },
  chipLabel: { fontSize: 11, color: colors.muted, fontWeight: '600', marginTop: 2 },

  sectionTitle: { color: colors.inkSoft, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  sectionRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  link:         { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },

  card: { marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', ...shadow },

  profileRow:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  profileAvatar:    { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  profileAvatarTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  profileName:      { color: colors.ink, fontSize: 15, fontWeight: '800' },
  profileEmail:     { color: colors.inkSoft, fontSize: 12, marginTop: 3 },
  meta:             { color: colors.muted, fontSize: 11, marginTop: 4 },

  userRow:     { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  uAvatar:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  uAvatarTxt:  { fontWeight: '800', fontSize: 13 },
  uMeta:       { flex: 1 },
  uName:       { color: colors.ink, fontSize: 14, fontWeight: '700' },
  uEmail:      { color: colors.muted, fontSize: 12, marginTop: 2 },
  badge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeAdmin:  { backgroundColor: colors.primarySoft },
  badgeUser:   { backgroundColor: colors.blueSoft },
  badgeTxt:    { fontSize: 11, fontWeight: '800' },

  empty: { padding: 20, textAlign: 'center', color: colors.muted },

  row:       { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowKey:    { color: colors.inkSoft, fontSize: 13 },
  rowVal:    { color: colors.ink, fontSize: 13, fontWeight: '700' },
});

export default DashboardScreen;
