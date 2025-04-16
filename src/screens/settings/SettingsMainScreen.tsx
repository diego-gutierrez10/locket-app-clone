import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';

// Tipar el hook useNavigation
type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings' // El nombre de esta pantalla en el RootStack (si estuviera)
>;

// Componente principal restaurado
const SettingsMainScreen = () => {
  console.log("⚙️ SettingsMainScreen: Inicializando componente restaurado");
  const { signOut, userProfile } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Inicialmente false, ya no necesitamos la carga forzada
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  // Efecto para verificar el estado del perfil (opcional, puede eliminarse si no es necesario)
  useEffect(() => {
    console.log("⚙️ Estado actual de userProfile:", userProfile ? "Disponible" : "No disponible");
    // Aquí podríamos añadir lógica si necesitamos reaccionar a cambios en userProfile
  }, [userProfile]);

  // Función para manejar el cierre de sesión
  const handleSignOut = async () => {
    if (isSigningOut) return; 
    setIsSigningOut(true);
    try {
      console.log("⚙️ Iniciando cierre de sesión...");
      await signOut();
      console.log("⚙️ Cierre de sesión completado.");
    } catch (error: any) {
      console.error("⚙️ Error al cerrar sesión:", error);
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Elementos del menú de configuración (actualizar onPress)
  const menuItems = [
    {
      title: 'Editar Perfil',
      description: 'Cambia tu nombre, foto y datos personales',
      icon: 'person-circle' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('EditProfile') // Navegar a la pantalla registrada en RootStack
    },
    {
      title: 'Privacidad',
      description: 'Configura quién puede ver tus fotos',
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('PrivacySettings')
    },
    {
      title: 'Notificaciones',
      description: 'Personaliza las alertas que recibes',
      icon: 'notifications' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('NotificationPrefs')
    },
    {
      title: 'Tema de la Aplicación',
      description: 'Elige entre modo claro u oscuro',
      icon: 'color-palette' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('AppTheme')
    }
  ];

  // Renderizar un elemento del menú
  const renderMenuItem = (item: any, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.menuItem}
        onPress={item.onPress} // Usar la acción definida en menuItems
      >
        <View style={styles.menuItemContent}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={item.icon} 
              size={22} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.menuItemText}>
            <Text style={styles.menuItemTitle}>{item.title}</Text>
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  };

  // Mostrar indicador de carga si está cargando (podría eliminarse si no es necesario)
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Renderizado principal del contenido
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Encabezado con saludo */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {userProfile?.username || 'Usuario'}!</Text>
          <Text style={styles.subtitle}>Gestiona tu cuenta y preferencias</Text>
        </View>

        {/* Sección de Configuración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración General</Text>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Sección de Cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <TouchableOpacity 
            style={[styles.signOutButton, isSigningOut && styles.buttonDisabled]} 
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
                <Text style={styles.signOutButtonText}>Cerrar Sesión</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Versión 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos (combinados de versiones anteriores)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003F91',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 25,
    paddingBottom: 15,
  },
  greeting: {
    fontSize: 26, // Más grande
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0D7FF', // Un azul más claro
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600', // Semi-bold
    color: '#FFFFFF',
    marginLeft: 20,
    marginBottom: 15,
    opacity: 0.9,
  },
  menuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Fondo sutil
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 1,
    borderBottomWidth: 1, // Separador
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5DA9E9', // Azul claro para íconos
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#B0D7FF', // Mismo color que subtítulo
    opacity: 0.8,
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935', // Rojo más oscuro
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    elevation: 2, // Sombra sutil en Android
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  versionText: {
    color: '#B0D7FF',
    fontSize: 12,
    opacity: 0.7,
  },
  // Estilos de carga (pueden eliminarse si no se usa isLoading)
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
  },
});

export default SettingsMainScreen; 