import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useUserViewModel } from '../../viewmodels/UserViewModel';
import { colors, radius, type } from '../../styles/theme';

const UserCard = ({ user, onEdit, onDelete }) => (
  <View style={styles.userCard}>
    <View style={[styles.avatar, user.role === 'admin' ? styles.avatarAdmin : styles.avatarUser]}>
      <Text style={styles.avatarText}>{user.initials || 'US'}</Text>
    </View>

    <View style={styles.userInfo}>
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.userEmail}>{user.email}</Text>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser]}>
          <Text style={[styles.badgeText, user.role === 'admin' ? styles.badgeAdminText : styles.badgeUserText]}>
            {user.role === 'admin' ? 'Admin' : 'Usuario'}
          </Text>
        </View>
        <View style={[styles.badge, user.isActive ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={[styles.badgeText, user.isActive ? styles.badgeActiveText : styles.badgeInactiveText]}>
            {user.isActive ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
    </View>

    <View style={styles.actions}>
      <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(user)}>
        <Text style={styles.actionButtonText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dangerButton} onPress={() => onDelete(user)}>
        <Text style={styles.dangerButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const UsersScreen = ({ navigation }) => {
  const {
    users,
    pagination,
    isLoading,
    error,
    successMessage,
    fetchUsers,
    deleteUser,
    clearMessages,
  } = useUserViewModel();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers({ page: 1, limit: 10 });
  }, [fetchUsers]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert('Listo', successMessage);
      clearMessages();
    }
  }, [successMessage, clearMessages]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers({ page: 1, limit: 10, search: search.trim() });
  };

  const handleDelete = (user) => {
    Alert.alert('Eliminar usuario', `¿Estás seguro de eliminar a ${user.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteUser(user.id) },
    ]);
  };

  const handleLoadMore = () => {
    if (pagination && page < pagination.totalPages && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers({ page: nextPage, limit: 10, search: search.trim() });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Usuarios</Text>
          <Text style={styles.subtitle}>Altas, roles y estado de acceso</Text>
        </View>
        <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate('UserForm', { user: null })}>
          <Text style={styles.newButtonText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o correo"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onEdit={(selected) => navigation.navigate('UserForm', {
              user: selected.toJSON ? selected.toJSON() : selected,
            })}
            onDelete={handleDelete}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchUsers({ page: 1, limit: 10, search: search.trim() })}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Sin usuarios</Text>
              <Text style={styles.emptyText}>Cuando agregues usuarios, apareceran aqui.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && users.length > 0 ? (
            <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
          ) : null
        }
        contentContainerStyle={styles.list}
      />

      {pagination ? (
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            {users.length} de {pagination.total} usuarios
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: type.title,
  subtitle: { ...type.body, marginTop: 4 },
  newButton: {
    minWidth: 72,
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#3B365B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButtonText: { color: colors.primaryDark, fontSize: 14, fontWeight: '800' },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 46,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.line,
    fontSize: 14,
    color: colors.ink,
  },
  searchButton: {
    minWidth: 76,
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  searchButtonText: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#F7B4AE',
  },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 112 },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarAdmin: { backgroundColor: colors.primarySoft },
  avatarUser: { backgroundColor: colors.blueSoft },
  avatarText: { color: colors.ink, fontWeight: '800', fontSize: 13 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 15, fontWeight: '800', color: colors.ink },
  userEmail: { fontSize: 12, color: colors.muted, marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  badgeAdmin: { backgroundColor: colors.primarySoft },
  badgeUser: { backgroundColor: colors.blueSoft },
  badgeActive: { backgroundColor: colors.successSoft },
  badgeInactive: { backgroundColor: colors.dangerSoft },
  badgeText: { fontSize: 11, fontWeight: '800' },
  badgeAdminText: { color: colors.primaryDark },
  badgeUserText: { color: colors.blue },
  badgeActiveText: { color: colors.success },
  badgeInactiveText: { color: colors.danger },
  actions: { alignItems: 'flex-end', gap: 8, marginLeft: 8 },
  actionButton: {
    minWidth: 58,
    minHeight: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: { color: colors.inkSoft, fontSize: 12, fontWeight: '800' },
  dangerButton: {
    minWidth: 58,
    minHeight: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: { color: colors.danger, fontSize: 12, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 70, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 6 },
  footerLoader: { padding: 16 },
  paginationInfo: {
    padding: 12,
    paddingBottom: 96,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
  paginationText: { fontSize: 13, color: colors.muted, fontWeight: '600' },
});

export default UsersScreen;
