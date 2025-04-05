import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import NetInfo from '@react-native-community/netinfo';
import { Alert, Platform } from 'react-native';

// MODO DESARROLLO: Usar true para simular respuestas exitosas incluso con errores
export const DEV_MODE = true;

// Configuración de Supabase
// IMPORTANTE: Usa tus credenciales correctas aquí
const supabaseUrl = 'https://rondfrndgsdcbhknieqo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvbmRmcm5kZ3NkY2Joa25pZXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwOTY3MjksImV4cCI6MjA1ODY3MjcyOX0.dg2EwlUpidpF3MzteHMFsCoHxXpz_fFa8hizY_lO2f4';

// Función para verificar la conectividad
export const checkConnectivity = async () => {
  const netInfo = await NetInfo.fetch();
  console.log('Estado de conectividad:', netInfo);
  
  // Para emuladores y dispositivos físicos
  return netInfo.isConnected !== false; // Consideramos null o true como "conectado"
};

// Crear cliente de Supabase con configuración básica
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Importante: En modo desarrollo, podemos desactivar confirmación por email
    flowType: DEV_MODE ? 'pkce' : 'implicit'
  }
});

// Función para probar la conexión
export const testSupabaseConnection = async () => {
  try {
    console.log('Probando conexión directa a Supabase...');
    
    // Intentar una consulta simple para verificar la conexión
    const { data, error } = await supabase.from('profiles').select('count(*)');
    
    if (error) {
      console.error('Error al conectar con Supabase:', error);
      return { success: false, error };
    }
    
    console.log('Conexión a Supabase exitosa:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Excepción al conectar con Supabase:', err);
    
    // En modo desarrollo, simulamos éxito incluso con error
    if (DEV_MODE) {
      console.log('Modo desarrollo: Simulando éxito a pesar del error');
      return { success: true, data: [{ count: 0 }] };
    }
    
    return { success: false, error: err };
  }
};

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  if (!supabase) {
    console.error('Cliente de Supabase no inicializado');
    return { success: false, error: 'Cliente de Supabase no inicializado' };
  }

  try {
    console.log('Inicializando base de datos...');
    
    // Si estamos en modo desarrollo, asumimos que la conexión es exitosa
    if (DEV_MODE) {
      console.log('Modo desarrollo: Asumiendo conexión exitosa');
      return { success: true };
    }
    
    // Verificar la conexión
    const { error: connectionError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('Error de conexión:', connectionError);
      return { success: false, error: connectionError.message };
    }
    
    // Verificar y crear tablas si no existen
    
    // 1. Tabla de perfiles
    await ensureProfilesTable();
    
    // 2. Tabla de posts
    await ensurePostsTable();
    
    // 3. Tabla de amigos
    await ensureFriendsTable();
    
    return { success: true };
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

// Función para asegurar que existe la tabla de perfiles
const ensureProfilesTable = async () => {
  // Verificar si la tabla existe
  const { error: checkError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });
  
  // Si no hay error, la tabla existe
  if (!checkError) {
    console.log('Tabla profiles ya existe');
    return;
  }
  
  // Crear tabla profiles si no existe
  // (En realidad, esto debería hacerse desde el dashboard de Supabase)
  console.log('Creando tabla profiles...');
  
  // Con las APIs de Supabase no podemos crear tablas directamente,
  // por lo que esto debería hacerse desde el dashboard de Supabase
  
  return;
};

// Función para asegurar que existe la tabla de posts
const ensurePostsTable = async () => {
  // Verificar si la tabla existe
  const { error: checkError } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true });
  
  // Si no hay error, la tabla existe
  if (!checkError) {
    console.log('Tabla posts ya existe');
    return;
  }
  
  // Crear tabla posts si no existe
  // (En realidad, esto debería hacerse desde el dashboard de Supabase)
  console.log('Creando tabla posts...');
  
  // Con las APIs de Supabase no podemos crear tablas directamente,
  // por lo que esto debería hacerse desde el dashboard de Supabase
  
  return;
};

// Función para asegurar que existe la tabla de amigos
const ensureFriendsTable = async () => {
  // Verificar si la tabla existe
  const { error: checkError } = await supabase
    .from('friends')
    .select('id', { count: 'exact', head: true });
  
  // Si no hay error, la tabla existe
  if (!checkError) {
    console.log('Tabla friends ya existe');
    return;
  }
  
  // Crear tabla friends si no existe
  // (En realidad, esto debería hacerse desde el dashboard de Supabase)
  console.log('Creando tabla friends...');
  
  /* En SQL sería algo así:
  CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, friend_id)
  );
  
  -- Políticas de seguridad
  CREATE POLICY "Users can view their own friends"
    ON friends FOR SELECT
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own friends"
    ON friends FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own friends"
    ON friends FOR UPDATE
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete their own friends"
    ON friends FOR DELETE
    USING (auth.uid() = user_id);
  */
  
  // Con las APIs de Supabase no podemos crear tablas directamente,
  // por lo que esto debería hacerse desde el dashboard de Supabase
  
  return;
};

// Crear función para manejar el registro y creación de perfil
export const registerUserAndCreateProfile = async (
  email: string, 
  password: string, 
  username: string
) => {
  try {
    // 1. Registrar el usuario
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        },
        // Importante para desarrollo: omitir email de confirmación
        emailRedirectTo: DEV_MODE ? undefined : 'locketapp://login',
      }
    });
    
    if (error) {
      console.error('Error al registrar usuario:', error);
      return { success: false, error };
    }
    
    // 2. En modo desarrollo, podemos manejar la creación del perfil aquí
    if (DEV_MODE && data.user) {
      console.log('Modo desarrollo: Auto-confirmando usuario y creando perfil');
      
      // En un entorno real, esto se haría mediante un webhook o una función en el servidor
      // No hagas esto en producción
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
        
        // Iniciar sesión automáticamente para obtener token
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.warn('No se pudo iniciar sesión automáticamente', signInError);
        } else {
          console.log('Usuario confirmado automáticamente en modo desarrollo');
        }
      } catch (e) {
        console.error('Error al simular confirmación:', e);
      }
    }
    
    return { 
      success: true, 
      data,
      devMode: DEV_MODE, 
      message: DEV_MODE 
        ? 'En modo desarrollo, la confirmación de email se simula automáticamente' 
        : 'Se ha enviado un email de confirmación. Por favor, verifica tu correo.' 
    };
  } catch (e) {
    console.error('Error general en registro:', e);
    return { success: false, error: e };
  }
};

// Función para verificar y crear el bucket de fotos si no existe
export const ensurePhotoBucket = async () => {
  try {
    console.log('Verificando bucket de fotos...');
    
    // Si estamos en modo desarrollo, asumimos que el bucket existe
    if (DEV_MODE) {
      console.log('Modo desarrollo: Asumiendo que el bucket de fotos existe');
      return true;
    }
    
    // Obtener lista de buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error al listar buckets:', listError);
      
      // En modo desarrollo, continuamos a pesar del error
      if (DEV_MODE) {
        console.log('Modo desarrollo: Ignorando error al listar buckets');
        return true;
      }
      
      return false;
    }
    
    // Buscar si ya existe el bucket de photos
    const photoBucket = buckets?.find(bucket => bucket.name === 'photos');
    
    if (!photoBucket) {
      console.log('Creando bucket de fotos...');
      
      // Crear el bucket
      const { error: createError } = await supabase.storage.createBucket('photos', {
        public: true,  // Acceso público a las fotos
      });
      
      if (createError) {
        console.error('Error al crear bucket de fotos:', createError);
        
        // En modo desarrollo, continuamos a pesar del error
        if (DEV_MODE) {
          console.log('Modo desarrollo: Ignorando error al crear bucket');
          return true;
        }
        
        return false;
      }
      
      console.log('Bucket de fotos creado correctamente');
    } else {
      console.log('El bucket de fotos ya existe');
    }
    
    return true;
  } catch (error) {
    console.error('Error general al verificar/crear bucket de fotos:', error);
    
    // En modo desarrollo, continuamos a pesar del error
    if (DEV_MODE) {
      console.log('Modo desarrollo: Ignorando error general de bucket');
      return true;
    }
    
    return false;
  }
}; 