import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, radius, shadow } from '../styles/theme';

import LoginScreen from '../views/auth/LoginScreen';
import RegisterScreen from '../views/auth/RegisterScreen';
import DashboardScreen from '../views/dashboard/DashboardScreen';
import UsersScreen from '../views/users/UsersScreen';
import UserFormScreen from '../views/users/UserFormScreen';
import UploadScreen from '../views/upload/UploadScreen';
import ProfileScreen from '../views/profile/ProfileScreen';
import NotificationScreen from '../views/notifications/NotificationScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused }) => (
  <View style={tabStyles.iconContainer}>
    <View style={[tabStyles.pill, focused && tabStyles.pillFocused]}>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>
        {label}
      </Text>
    </View>
  </View>
);const MainTabs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Inicio" focused={focused} />
          ),
        }}
      />
      {isAdmin ? (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Usuarios" focused={focused} />
            ),
          }}
        />
      ) : null}
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Archivos" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Notif." focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Perfil" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AuthenticatedStack = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      {isAdmin ? (
        <Stack.Screen name="UserForm" component={UserFormScreen} options={{ title: 'Usuario' }} />
      ) : null}
    </Stack.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashLogo}>
          <Text style={styles.splashLogoText}>FC</Text>
        </View>
        <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
        <Text style={styles.splashText}>Preparando tu sesion...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthenticatedStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  splashLogo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogoText: { color: '#fff', fontSize: 24, fontWeight: '900' },
  loader: { marginTop: 24 },
  splashText: { marginTop: 12, color: colors.muted, fontSize: 14 },
});

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    height: 68,
    paddingBottom: 10,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillFocused: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
  },
  labelFocused: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
});

export default AppNavigator;
