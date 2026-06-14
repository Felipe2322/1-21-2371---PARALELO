import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/theme';

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

const TabGlyph = ({ name, focused }) => {
  const tone = focused ? tabStyles.glyphActive : tabStyles.glyphIdle;
  const line = focused ? tabStyles.glyphLineActive : tabStyles.glyphLineIdle;

  if (name === 'home') {
    return (
      <View style={tabStyles.glyphBox}>
        <View style={[tabStyles.homeRoof, line]} />
        <View style={[tabStyles.homeBase, tone]} />
      </View>
    );
  }

  if (name === 'users') {
    return (
      <View style={tabStyles.glyphBox}>
        <View style={[tabStyles.userBack, line]} />
        <View style={[tabStyles.userHead, tone]} />
        <View style={[tabStyles.userBody, tone]} />
      </View>
    );
  }

  if (name === 'files') {
    return (
      <View style={tabStyles.glyphBox}>
        <View style={[tabStyles.fileTab, line]} />
        <View style={[tabStyles.fileBody, tone]} />
      </View>
    );
  }

  if (name === 'bell') {
    return (
      <View style={tabStyles.glyphBox}>
        <View style={[tabStyles.bellDome, tone]} />
        <View style={[tabStyles.bellBase, line]} />
        <View style={[tabStyles.bellDot, tone]} />
      </View>
    );
  }

  return (
    <View style={tabStyles.glyphBox}>
      <View style={[tabStyles.profileHead, tone]} />
      <View style={[tabStyles.profileBody, line]} />
    </View>
  );
};

const TabIcon = ({ label, icon, focused }) => (
  <View style={[tabStyles.item, focused && tabStyles.itemFocused]}>
    <View style={[tabStyles.iconPlate, focused && tabStyles.iconPlateFocused]}>
      <TabGlyph name={icon} focused={focused} />
    </View>
    <Text numberOfLines={1} style={[tabStyles.label, focused && tabStyles.labelFocused]}>
      {label}
    </Text>
  </View>
);

const MainTabs = () => {
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
            <TabIcon label="Inicio" icon="home" focused={focused} />
          ),
        }}
      />
      {isAdmin ? (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon label="Usuarios" icon="users" focused={focused} />
            ),
          }}
        />
      ) : null}
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Archivos" icon="files" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Avisos" icon="bell" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Perfil" icon="profile" focused={focused} />
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
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: Platform.OS === 'ios' ? 18 : 12,
    height: 76,
    backgroundColor: '#171A24',
    borderWidth: 1,
    borderColor: '#303449',
    borderRadius: 24,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
  item: {
    width: 66,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    gap: 4,
  },
  itemFocused: {
    backgroundColor: '#222034',
  },
  iconPlate: {
    width: 30,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlateFocused: {},
  label: {
    width: 62,
    color: '#747891',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  labelFocused: {
    color: '#D8D1FF',
  },
  glyphBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphActive: {
    backgroundColor: '#9B8CFF',
    borderColor: '#9B8CFF',
  },
  glyphIdle: {
    backgroundColor: '#6F738A',
    borderColor: '#6F738A',
  },
  glyphLineActive: {
    backgroundColor: '#C9C1FF',
    borderColor: '#C9C1FF',
  },
  glyphLineIdle: {
    backgroundColor: '#555A71',
    borderColor: '#555A71',
  },
  homeRoof: {
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
    marginBottom: -8,
  },
  homeBase: {
    width: 15,
    height: 12,
    borderRadius: 4,
  },
  userBack: {
    position: 'absolute',
    left: 3,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
  userHead: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 3,
  },
  userBody: {
    width: 17,
    height: 9,
    borderRadius: 8,
    marginTop: 2,
  },
  fileTab: {
    width: 10,
    height: 5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    alignSelf: 'flex-start',
    marginLeft: 4,
    marginBottom: -1,
  },
  fileBody: {
    width: 18,
    height: 15,
    borderRadius: 5,
  },
  bellDome: {
    width: 15,
    height: 14,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginTop: 3,
  },
  bellBase: {
    width: 18,
    height: 3,
    borderRadius: 3,
    marginTop: -1,
  },
  bellDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 1,
  },
  profileHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 2,
  },
  profileBody: {
    width: 18,
    height: 9,
    borderRadius: 9,
    marginTop: 3,
  },
});

export default AppNavigator;
