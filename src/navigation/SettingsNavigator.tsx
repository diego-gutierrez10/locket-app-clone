import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar pantallas de configuración
import SettingsMainScreen from '../screens/settings/SettingsMainScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import PrivacySettingsScreen from '../screens/settings/PrivacySettingsScreen';
import NotificationPrefsScreen from '../screens/settings/NotificationPrefsScreen';
import AppThemeScreen from '../screens/settings/AppThemeScreen';

// Definir tipos para el navegador de configuración
export type SettingsStackParamList = {
  SettingsMain: undefined;
  EditProfile: undefined;
  PrivacySettings: undefined;
  NotificationPrefs: undefined;
  AppTheme: undefined;
};

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsNavigator = () => {
  return (
    <SettingsStack.Navigator
      initialRouteName="SettingsMain"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#003F91',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#003F91',
        },
      }}
    >
      <SettingsStack.Screen 
        name="SettingsMain" 
        component={SettingsMainScreen} 
        options={{ title: 'Configuración' }}
      />
      <SettingsStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Editar Perfil' }}
      />
      <SettingsStack.Screen 
        name="PrivacySettings" 
        component={PrivacySettingsScreen} 
        options={{ title: 'Privacidad' }}
      />
      <SettingsStack.Screen 
        name="NotificationPrefs" 
        component={NotificationPrefsScreen} 
        options={{ title: 'Notificaciones' }}
      />
      <SettingsStack.Screen 
        name="AppTheme" 
        component={AppThemeScreen} 
        options={{ title: 'Tema' }}
      />
    </SettingsStack.Navigator>
  );
};

export default SettingsNavigator; 