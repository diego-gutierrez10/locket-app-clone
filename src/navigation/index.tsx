import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

// Importamos nuestras pantallas reales
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FeedScreen from '../screens/FeedScreen';
import CameraScreen from '../screens/CameraScreen';

// Pantallas temporales para las que aún no hemos implementado
const TempScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Pantalla {name}</Text>
  </View>
);

// Componentes de pantalla temporales que aún faltan implementar
const FriendsScreen = () => <TempScreen name="Friends" />;
const ChatScreen = () => <TempScreen name="Chat" />;

// Tipos para nuestras navegaciones
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Camera: undefined;
  Friends: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Chat: { userId: string; username: string; avatarUrl?: string };
};

// Crear navegadores
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Navegación para usuarios no autenticados
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Navegación tabular principal
const MainTabNavigator = () => {
  return (
    <MainTab.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#003F91',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#5DA9E9',
      }}
    >
      <MainTab.Screen name="Feed" component={FeedScreen} />
      <MainTab.Screen name="Camera" component={CameraScreen} />
      <MainTab.Screen name="Friends" component={FriendsScreen} />
    </MainTab.Navigator>
  );
};

// Componente para los iconos de la barra de navegación (implementaremos más tarde)
const TabBarIcon = ({ name, color }: { name: string; color: string }) => {
  return null;
};

// Navegación general con navegación anidada
const Navigation = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  return (
    <NavigationContainer>
      {user ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Main" component={MainTabNavigator} />
          <RootStack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{
              headerShown: true,
              headerTitle: 'Chat',
            }}
          />
        </RootStack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default Navigation; 