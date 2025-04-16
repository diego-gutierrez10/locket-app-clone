import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, DEV_MODE, registerUserAndCreateProfile } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// Importar tipos de navegación
// import { NavigationContainerRef } from '@react-navigation/native';
// import { RootStackParamList } from '../navigation'; // Asegúrate que la ruta es correcta

// Profile type with additional user information
export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  full_name?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: any }>;
  uploadAvatar: () => Promise<{ success: boolean; avatarUrl?: string; error?: any }>;
  refreshProfile: () => Promise<void>;
  // Eliminar navigationRef de la interfaz
  // navigationRef: React.MutableRefObject<NavigationContainerRef<RootStackParamList> | null>;
}

// Valores iniciales para el contexto
const initialValues: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  profileLoading: false,
  userProfile: null,
  signIn: async () => ({ data: null, error: new Error('Not implemented') }),
  signUp: async () => ({ data: null, error: new Error('Not implemented') }),
  signOut: async () => {},
  updateProfile: async () => ({ success: false, error: new Error('Not implemented') }),
  uploadAvatar: async () => ({ success: false, error: new Error('Not implemented') }),
  refreshProfile: async () => {},
  // Eliminar navigationRef de los valores iniciales
  // navigationRef: useRef<NavigationContainerRef<RootStackParamList> | null>(null), // ¡Hook inválido aquí!
};

// Crear el contexto
const AuthContext = createContext<AuthContextType>(initialValues);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor del contexto de autenticación
interface AuthProviderProps {
  children: ReactNode;
}

// Función auxiliar para datos de prueba en modo desarrollo
const generateMockUser = (email: string, username: string) => {
  return {
    id: `mock-user-${Date.now()}`,
    email,
    user_metadata: {
      username,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    },
    created_at: new Date().toISOString(),
  };
};

// Función auxiliar para generar perfil de prueba
const generateMockProfile = (userId: string, username: string): UserProfile => {
  return {
    id: userId,
    username,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    created_at: new Date().toISOString(),
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Eliminar la creación del ref aquí
  // const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Efecto para comprobar y sincronizar la sesión del usuario
  useEffect(() => {
    // Verificar si hay una sesión activa
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
      }
      
      setSession(session);
      setUser(session?.user || null);
      
      // Si tenemos un usuario, cargar su perfil
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    checkSession();

    // Suscribirse a los cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user || null);

        // Eliminar la lógica de navegación para PASSWORD_RECOVERY de aquí
        /*
        if (event === 'PASSWORD_RECOVERY') {
          console.log('🔑 Evento PASSWORD_RECOVERY detectado!');
          // Esta lógica ahora está en Navigation.tsx
        } else */ if (session?.user) { // Mantener el else if si es necesario o simplificar a if
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          setLoading(false); // Asegurarse que loading se pone a false si no hay sesión
        }
      }
    );

    // Limpiar la suscripción al desmontar
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Obtener el perfil del usuario
  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      
      if (DEV_MODE) {
        // En modo desarrollo, generar perfil de prueba
        const mockUsername = user?.email?.split('@')[0] || 'user';
        const mockProfile = generateMockProfile(userId, mockUsername);
        setUserProfile(mockProfile);
        console.log('Modo desarrollo: Perfil de usuario simulado cargado');
        return;
      }
      
      // Obtener el perfil del usuario de la base de datos
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        setUserProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setProfileLoading(false);
      setLoading(false);
    }
  };

  // Refrescar el perfil del usuario
  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  // Iniciar sesión con email y contraseña
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Registrar un nuevo usuario
  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    console.log('Iniciando registro con:', { email, username });
    
    try {
      // Usamos la función unificada de registro y creación de perfil
      const result = await registerUserAndCreateProfile(email, password, username);
      
      if (!result.success) {
        console.error('Error en el proceso de registro:', result.error);
        return { 
          data: null, 
          error: result.error 
        };
      }
      
      console.log('Registro procesado correctamente:', result.message);
      
      // Si estamos en modo desarrollo, mostrar información adicional
      if (DEV_MODE) {
        console.log('Modo desarrollo activo: Proceso de registro simulado correctamente');
      }
      
      // Formateamos la respuesta para que coincida con el tipo esperado
      return { 
        data: result.data, 
        error: null 
      };
    } catch (error) {
      console.error('Error general en registro:', error);
      return { 
        data: null,
        error: error as Error
      };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar el perfil del usuario
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: new Error('No user logged in') };
    }
    
    try {
      setProfileLoading(true);
      
      if (DEV_MODE) {
        // En modo desarrollo, actualizar el perfil simulado
        setUserProfile(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
        console.log('Modo desarrollo: Perfil actualizado (simulado):', updates);
        return { success: true };
      }
      
      // Actualizar el perfil en la base de datos
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error };
      }
      
      // Actualizar el perfil en el estado
      setUserProfile(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null);
      
      return { success: true };
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { success: false, error };
    } finally {
      setProfileLoading(false);
    }
  };

  // Subir avatar
  const uploadAvatar = async () => {
    if (!user) {
      return { success: false, error: new Error('No user logged in') };
    }
    
    try {
      // Solicitar permisos para acceder a la galería
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        return { 
          success: false, 
          error: new Error('Permission to access media library was denied') 
        };
      }
      
      // Abrir selector de imágenes
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (pickerResult.canceled) {
        return { success: false };
      }
      
      setProfileLoading(true);
      
      if (DEV_MODE) {
        // En modo desarrollo, simular subida de avatar
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
        await updateProfile({ avatar_url: avatarUrl });
        console.log('Modo desarrollo: Avatar actualizado (simulado)');
        return { success: true, avatarUrl };
      }
      
      // Obtener la URI de la imagen seleccionada
      const uri = pickerResult.assets[0].uri;
      const fileExt = uri.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Convertir la imagen a un formato que Supabase pueda manejar
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Subir la imagen a Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);
      
      if (error) {
        console.error('Error uploading avatar:', error);
        return { success: false, error };
      }
      
      // Obtener la URL pública del avatar
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Actualizar el perfil con la nueva URL del avatar
      const updateResult = await updateProfile({ avatar_url: publicUrl });
      
      if (!updateResult.success) {
        return updateResult;
      }
      
      return { success: true, avatarUrl: publicUrl };
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      return { success: false, error };
    } finally {
      setProfileLoading(false);
    }
  };

  // Valores del contexto
  const value: AuthContextType = {
    user,
    session,
    loading,
    profileLoading,
    userProfile,
    signIn,
    signUp,
    signOut,
    updateProfile,
    uploadAvatar,
    refreshProfile,
    // Eliminar navigationRef del valor del proveedor
    // navigationRef,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 