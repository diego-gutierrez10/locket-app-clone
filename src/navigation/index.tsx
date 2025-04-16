import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';

// Importamos nuestras pantallas reales
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FeedScreen from '../screens/FeedScreen';
import CameraScreen from '../screens/CameraScreen';
import SettingsMainScreen from '../screens/settings/SettingsMainScreen';

// Importamos las sub-pantallas de configuración
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import PrivacySettingsScreen from '../screens/settings/PrivacySettingsScreen';
import NotificationPrefsScreen from '../screens/settings/NotificationPrefsScreen';
import AppThemeScreen from '../screens/settings/AppThemeScreen';

// Importar el componente correcto de Amigos
import SimpleFriendsScreen from '../screens/SimpleFriendsScreen';

// Importar la nueva pantalla
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

// Pantallas temporales para las que aún no hemos implementado
const TempScreen = ({ route }: { route: { params: { name: string } } }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Pantalla {route.params.name}</Text>
  </View>
);

// Componentes de pantalla temporales que aún faltan implementar
const ChatScreen = () => <TempScreen route={{ params: { name: 'Chat' } }} />;

// Tipos para nuestras navegaciones
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Camera: undefined;
  Friends: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Chat: { userId: string };
  EditProfile: undefined;
  PrivacySettings: undefined;
  NotificationPrefs: undefined;
  AppTheme: undefined;
};

// Crear navegadores
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Configuración de Linking Simplificada
const prefix = Linking.createURL('/'); 

const linkingConfig = {
  prefixes: [prefix],
  config: {
    // No necesitamos especificar pantallas aquí si solo usamos el esquema base
    // y dependemos del listener onAuthStateChange para la navegación interna.
    screens: {},
  },
};

// Navegación para usuarios no autenticados
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Navegación tabular principal
const MainTabNavigatorComponent = () => (
  <MainTab.Navigator
    initialRouteName="Feed"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';
        if (route.name === 'Feed') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Camera') iconName = focused ? 'camera' : 'camera-outline';
        else if (route.name === 'Friends') iconName = focused ? 'people' : 'people-outline';
        else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#003F91',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
    })}
  >
    <MainTab.Screen name="Feed" component={FeedScreen} options={{ title: 'Inicio' }} />
    <MainTab.Screen name="Camera" component={CameraScreen} options={{ title: 'Cámara' }} />
    <MainTab.Screen name="Friends" component={SimpleFriendsScreen} options={{ title: 'Amigos' }} />
    <MainTab.Screen name="Settings" component={SettingsMainScreen} options={{ title: 'Ajustes' }} />
  </MainTab.Navigator>
);

// Componente para los iconos de la barra de navegación (implementaremos más tarde)
const TabBarIcon = ({ name, color }: { name: string; color: string }) => {
  return null;
};

// Definir un tipo para las props que recibirá Navigation
interface NavigationProps {
  // No necesitamos pasar el ref directamente
}

// Definir un tipo para el handle que expondremos con el ref
export interface NavigationHandle {
  getRef: () => React.RefObject<NavigationContainerRef<AuthStackParamList | RootStackParamList>>;
}

// Usar forwardRef para poder pasar un ref desde App.tsx
const Navigation = forwardRef<NavigationHandle, NavigationProps>((props, ref) => {
  console.log('[Navigation] Componente renderizado (forwardRef).');

  const { user, loading } = useAuth(); // Ya no necesitamos session aquí
  const navigationRefInternal = useRef<NavigationContainerRef<AuthStackParamList | RootStackParamList>>(null);

  // Exponer una función para obtener el ref interno usando useImperativeHandle
  useImperativeHandle(ref, () => ({
    getRef: () => navigationRefInternal,
  }));

  if (loading) {
    return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator size="large" color="#FFFFFF"/></View>;
  }

  return (
    <NavigationContainer 
      ref={navigationRefInternal} // Usar el ref interno
      linking={linkingConfig} 
      fallback={<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text>Loading...</Text></View>}
    >
      <RootStack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#003F91' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {user ? (
          <>
            <RootStack.Screen 
              name="Main" 
              component={MainTabNavigatorComponent} 
              options={{ headerShown: false }}
            />
            <RootStack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={({ route }) => ({ 
                title: `Chat con ${route.params?.userId || 'Usuario'}`,
                headerShown: true,
              })} 
            />
            <RootStack.Screen 
              name="EditProfile" 
              component={EditProfileScreen} 
              options={{ title: 'Editar Perfil', headerShown: true }}
            />
            <RootStack.Screen 
              name="PrivacySettings" 
              component={PrivacySettingsScreen} 
              options={{ title: 'Privacidad', headerShown: true }}
            />
            <RootStack.Screen 
              name="NotificationPrefs" 
              component={NotificationPrefsScreen} 
              options={{ title: 'Notificaciones', headerShown: true }}
            />
            <RootStack.Screen 
              name="AppTheme" 
              component={AppThemeScreen} 
              options={{ title: 'Tema de la Aplicación', headerShown: true }}
            />
          </>
        ) : (
          <RootStack.Screen 
            name="Auth"
            component={AuthNavigator} 
            options={{ headerShown: false }} 
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
});

export default Navigation; 