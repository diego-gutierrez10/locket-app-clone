import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definir tipos para las preferencias de notificaciones
export interface NotificationPreferences {
  newPhotos: boolean;
  messages: boolean;
  friendRequests: boolean;
  appUpdates: boolean;
  sound: 'default' | 'silent' | 'vibrate';
}

// Definir tipos para las preferencias de privacidad (SIN photoVisibility)
export interface PrivacyPreferences {
  profileVisibility: boolean;
  onlineStatus: boolean;
  allowTagging: boolean;
}

// Tipo para el contexto de preferencias de usuario (SIN photoVisibility)
interface UserPreferencesContextType {
  // Preferencias de notificaciones
  notifications: NotificationPreferences;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  
  // Preferencias de privacidad
  privacy: PrivacyPreferences;
  updatePrivacyPreferences: (prefs: Partial<PrivacyPreferences>) => Promise<void>;
  
  // Estado de carga
  loading: boolean;
}

// Valores por defecto para las preferencias
const defaultNotificationPreferences: NotificationPreferences = {
  newPhotos: true,
  messages: true,
  friendRequests: true,
  appUpdates: false,
  sound: 'default'
};

// Valores por defecto para las preferencias (SIN photoVisibility)
const defaultPrivacyPreferences: PrivacyPreferences = {
  profileVisibility: true,
  onlineStatus: true,
  allowTagging: true
};

// Crear el contexto
const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Componente proveedor del contexto
export const UserPreferencesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Estados para las preferencias
  const [notifications, setNotifications] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [privacy, setPrivacy] = useState<PrivacyPreferences>(defaultPrivacyPreferences);
  const [loading, setLoading] = useState(true);

  // Cargar preferencias al montar el componente
  useEffect(() => {
    loadPreferences();
  }, []);

  // Función para cargar preferencias desde AsyncStorage
  const loadPreferences = async () => {
    try {
      setLoading(true);
      
      // Cargar preferencias de notificaciones
      const notificationPrefs = await AsyncStorage.getItem('notificationPreferences');
      if (notificationPrefs) {
        setNotifications(JSON.parse(notificationPrefs));
      }
      
      // Cargar preferencias de privacidad
      const privacyPrefsString = await AsyncStorage.getItem('privacyPreferences');
      if (privacyPrefsString) {
        const savedPrivacyPrefs = JSON.parse(privacyPrefsString);
        // Asegurarse de no incluir photoVisibility si existía en storage
        const { photoVisibility, ...validPrivacyPrefs } = savedPrivacyPrefs;
        setPrivacy(validPrivacyPrefs);
      }
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar preferencias de notificaciones
  const updateNotificationPreferences = async (prefs: Partial<NotificationPreferences>) => {
    try {
      // Actualizar estado local
      const updatedPrefs = { ...notifications, ...prefs };
      setNotifications(updatedPrefs);
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(updatedPrefs));
      
      // Aquí se podría sincronizar con el backend si fuera necesario
      console.log('Preferencias de notificaciones actualizadas:', updatedPrefs);
    } catch (error) {
      console.error('Error al actualizar preferencias de notificaciones:', error);
      throw error;
    }
  };

  // Función para actualizar preferencias de privacidad (SIN photoVisibility)
  const updatePrivacyPreferences = async (prefs: Partial<PrivacyPreferences>) => {
    try {
      // Asegurarse de que prefs no contenga photoVisibility explícitamente
      const { photoVisibility, ...validPrefs } = prefs as any; // Usar 'as any' con cuidado
      
      const updatedPrefs = { ...privacy, ...validPrefs };
      setPrivacy(updatedPrefs);
      
      await AsyncStorage.setItem('privacyPreferences', JSON.stringify(updatedPrefs));
      console.log('Preferencias de privacidad actualizadas:', updatedPrefs);
    } catch (error) {
      console.error('Error al actualizar preferencias de privacidad:', error);
      throw error;
    }
  };

  // Valor del contexto (SIN photoVisibility implícitamente)
  const contextValue: UserPreferencesContextType = {
    notifications,
    updateNotificationPreferences,
    privacy,
    updatePrivacyPreferences,
    loading
  };

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

// Hook para usar el contexto de preferencias de usuario
export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences debe usarse dentro de un UserPreferencesProvider');
  }
  return context;
}; 