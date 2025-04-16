import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Navigation from './src/navigation';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserPreferencesProvider } from './src/contexts/UserPreferencesContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { initializeDatabase, DEV_MODE, ensurePhotoBucket } from './src/lib/supabase';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Monitoreamos la conexión a internet
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // Consideramos conectado si isConnected no es explícitamente false
      const connected = state.isConnected !== false;
      setIsConnected(connected);
      
      // Mostramos alerta solo si estamos seguros que no hay conexión y no estamos en dev mode
      if (state.isConnected === false && !DEV_MODE) {
        console.warn('Se detectó desconexión de internet:', state);
        Alert.alert(
          'Sin conexión a internet',
          'La app requiere conexión a internet para funcionar correctamente. Por favor conecta tu dispositivo a internet.',
          [{ text: 'OK' }]
        );
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Función para inicializar la aplicación
  async function init() {
    try {
      // Inicializar la base de datos
      const dbInitResult = await initializeDatabase();
      
      if (!dbInitResult.success) {
        console.warn('No se pudo inicializar la base de datos:', dbInitResult.error);
        
        // Mostrar alerta solo si no estamos en modo desarrollo
        if (!DEV_MODE) {
          Alert.alert('Error de conexión', 
            'No se pudo conectar con el servidor. Algunas funciones podrían no estar disponibles.'
          );
        }
      }
      
      // En modo desarrollo, no verificamos el bucket de fotos
      // para evitar errores de conexión
      if (!DEV_MODE) {
        // Verificar que exista el bucket de fotos
        const bucketExists = await ensurePhotoBucket();
        
        if (!bucketExists) {
          console.warn('No se pudo verificar/crear el bucket de fotos');
          
          // Mostrar alerta solo si no estamos en modo desarrollo
          if (!DEV_MODE) {
            Alert.alert('Error de configuración', 
              'No se pudo acceder al sistema de almacenamiento. La función de subir fotos podría no estar disponible.'
            );
          }
        }
      }
    } catch (error) {
      console.error('Error en inicialización:', error);
    } finally {
      // Independientemente del resultado, marcamos como inicializado
      setInitialized(true);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003F91" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {!isConnected && (
        <View style={styles.offlineWarning}>
          <Text style={styles.offlineText}>Sin conexión a internet</Text>
        </View>
      )}
      {DEV_MODE && (
        <View style={[
          styles.devModeWarning, 
          !isConnected && styles.devModeWarningWithOffline
        ]}>
          <Text style={styles.devModeText}>MODO DESARROLLO</Text>
        </View>
      )}
      <ThemeProvider>
        <UserPreferencesProvider>
          <AuthProvider>
            <Navigation />
          </AuthProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  offlineWarning: {
    backgroundColor: '#ff5252',
    paddingVertical: 8,
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  offlineText: {
    color: 'white',
    fontWeight: 'bold',
  },
  devModeWarning: {
    backgroundColor: '#ff9800',
    paddingVertical: 8,
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  devModeWarningWithOffline: {
    top: 80, // Ajustamos la posición cuando también se muestra el aviso de sin conexión
  },
  devModeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
