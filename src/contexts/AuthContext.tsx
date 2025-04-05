import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, DEV_MODE, registerUserAndCreateProfile } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Platform, Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
}

// Valores iniciales para el contexto
const initialValues: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ data: null, error: new Error('Not implemented') }),
  signUp: async () => ({ data: null, error: new Error('Not implemented') }),
  signOut: async () => {},
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      setLoading(false);
    };

    checkSession();

    // Suscribirse a los cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Limpiar la suscripción al desmontar
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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

  // Valores del contexto
  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 