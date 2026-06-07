import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDashboardViewModel } from '../../viewmodels/DashboardViewModel';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, shadow, type } from '../../styles/theme';

const StatTile = ({ label, value, tone }) => (
  <View style={styles.statTile}>
    <View style={[styles.statRule, { backgroundColor: tone }]} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const UserRow = ({ user }) => (
  <View style={styles.userRow}>
    <View style={[styles.avatar, user.role === 'admin' ? styles.avatarAdmin : styles.avatarUser]}>
      <Text style={styles.avatarText}>{user.initials || 'US'}</Text>
    </View>
    <View style={styles.userMeta}>
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.userEmail}>{user.email}</Text>
    </View>
    <View style={[styles.rolePill, user.role === 'admin' ? styles.adminPill : styles.userPill]}>
      <Text style={[styles.roleText, user.role === 'admin' ? styles.adminText : styles.userText]}>
        {user.role === 'admin' ? 'Admin' : 'Usuario'}
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando panel...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => loadDashboard({ includeUsers: isAdmin })}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Panel movil</Text>
          <Text style={styles.title}>Hola, {user?.name?.split(' ')[0] || 'Felix'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{error}</Text>
        </View>
      ) : null}

      {dashboardData ? (
        <>
          <View style={styles.statsGrid}>
            {isAdmin ? (
              <StatTile label="Usuarios" value={dashboardData.totalUsers} tone={colors.primary} />
            ) : null}
            <StatTile label="Archivos" value={dashboardData.files.length} tone={colors.blue} />
            <StatTile label="Version API" value={dashboardData.config.version || '-'} tone={colors.amber} />
            <StatTile
              label="Estado"
              value={dashboardData.config.maintenance ? 'Mant.' : 'Activo'}
              tone={dashboardData.config.maintenance ? colors.amber : colors.success}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cuenta</Text>
            {loadTime ? <Text style={styles.metaText}>Actualizado en {loadTime} ms</Text> : null}
          </View>

          <View style={styles.profilePanel}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {(user?.initials || user?.name?.split(' ').map((item) => item[0]).join('') || 'FC')
                  .toUpperCase()
                  .slice(0, 2)}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{dashboardData.profile.name}</Text>
              <Text style={styles.profileEmail}>{dashboardData.profile.email}</Text>
              <Text style={styles.profileRole}>
                {dashboardData.profile.role === 'admin' ? 'Administrador' : 'Usuario'}
              </Text>
            </View>
          </View>

          {isAdmin ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Usuarios recientes</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Users')}>
                  <Text style={styles.linkText}>Ver lista</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.listPanel}>
                {dashboardData.users.length === 0 ? (
                  <Text style={styles.emptyText}>No hay usuarios registrados.</Text>
                ) : (
                  dashboardData.users.map((item) => <UserRow key={item.id} user={item} />)
                )}
              </View>
            </>
          ) : (
            <View style={styles.accessPanel}>
              <Text style={styles.accessTitle}>Acceso de usuario</Text>
              <Text style={styles.accessText}>
                Tu cuenta puede gestionar perfil y archivos. La administracion de usuarios queda reservada para administradores.
              </Text>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Servicio</Text>
          </View>
          <View style={styles.configPanel}>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>API</Text>
              <Text style={styles.configValue}>{dashboardData.config.appName}</Text>
            </View>
            <View style={styles.configRow}>
              <Text style={styles.configLabel}>Subida de archivos</Text>
              <Text style={styles.configValue}>
                {dashboardData.config.features?.fileUpload ? 'Disponible' : 'Inactiva'}
              </Text>
            </View>
            <View style={styles.configRowLast}>
              <Text style={styles.configLabel}>Tamano maximo</Text>
              <Text style={styles.configValue}>{dashboardData.config.features?.maxFileSize || '-'}</Text>
            </View>
          </View>
        </>
      ) : null}

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: { marginTop: 14, color: colors.inkSoft, fontSize: 14, fontWeight: '600' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kicker: { fontSize: 12, color: colors.primaryDark, fontWeight: '800', textTransform: 'uppercase' },
  title: { fontSize: 25, fontWeight: '800', color: colors.ink, marginTop: 4 },
  logoutButton: {
    minWidth: 64,
    minHeight: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  logoutButtonText: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  notice: {
    margin: 16,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#F7B4AE',
  },
  noticeText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  statTile: {
    width: '46%',
    margin: '2%',
    minHeight: 108,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    ...shadow,
  },
  statRule: { width: 34, height: 3, borderRadius: 2, marginBottom: 14 },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.ink },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 4, fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  sectionTitle: type.section,
  metaText: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  linkText: { fontSize: 13, color: colors.primaryDark, fontWeight: '800' },
  profilePanel: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    ...shadow,
  },
  profileAvatar: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  profileAvatarText: { color: colors.surface, fontSize: 18, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '800', color: colors.ink },
  profileEmail: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  profileRole: { fontSize: 12, color: colors.primaryDark, fontWeight: '800', marginTop: 6 },
  listPanel: {
    marginHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadow,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  avatarAdmin: { backgroundColor: colors.primarySoft },
  avatarUser: { backgroundColor: colors.blueSoft },
  avatarText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  userMeta: { flex: 1 },
  userName: { fontSize: 14, color: colors.ink, fontWeight: '700' },
  userEmail: { fontSize: 12, color: colors.muted, marginTop: 2 },
  rolePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm },
  adminPill: { backgroundColor: colors.primarySoft },
  userPill: { backgroundColor: colors.blueSoft },
  roleText: { fontSize: 11, fontWeight: '800' },
  adminText: { color: colors.primaryDark },
  userText: { color: colors.blue },
  emptyText: { padding: 18, color: colors.muted, fontSize: 14, textAlign: 'center' },
  accessPanel: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    ...shadow,
  },
  accessTitle: { fontSize: 15, color: colors.ink, fontWeight: '800', marginBottom: 5 },
  accessText: { fontSize: 13, color: colors.inkSoft, lineHeight: 19 },
  configPanel: {
    marginHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    ...shadow,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  configRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    padding: 13,
  },
  configLabel: { flex: 1, fontSize: 13, color: colors.muted, fontWeight: '600' },
  configValue: { flex: 1, textAlign: 'right', fontSize: 13, color: colors.ink, fontWeight: '700' },
  bottomSpace: { height: 32 },
});

export default DashboardScreen;
