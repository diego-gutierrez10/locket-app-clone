import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation';
import { useAuth } from '../contexts/AuthContext';
import { checkConnectivity, DEV_MODE } from '../lib/supabase';
import NetInfo from '@react-native-community/netinfo';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  
  const { signUp } = useAuth();

  // Verificar conectividad
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkConnectivity();
      setIsConnected(isConnected);
    };
    
    checkConnection();
    
    // Suscribirse a cambios de conectividad
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected !== false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    // Verificar conectividad antes de intentar registrarse
    if (!isConnected && !DEV_MODE) {
      Alert.alert(
        'Sin conexión a internet',
        'Se requiere conexión a internet para registrarse. Por favor verifica tu conexión e intenta nuevamente.'
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signUp(email, password, username);
      
      if (result.error) {
        Alert.alert('Error', result.error.message || 'Falló el registro');
      } else {
        // En modo desarrollo, podemos mostrar un mensaje personalizado
        if (DEV_MODE) {
          Alert.alert(
            'Cuenta creada',
            'Tu cuenta ha sido creada exitosamente en modo desarrollo. En una aplicación real, recibirías un correo de confirmación.',
            [{ text: 'OK' }]
          );
        }
        // En modo producción, Supabase maneja la verificación por email
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      Alert.alert('Error', error.message || 'Falló el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Línea de acento vertical */}
      <View style={styles.accentLine} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentContainer}>
            {/* Botón de retroceso */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Locket and connect with friends</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor="#FFFFFF70"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#FFFFFF70"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password (min. 6 characters)"
                placeholderTextColor="#FFFFFF70"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.registerButton, isLoading && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
            
            {DEV_MODE && (
              <View style={styles.devModeContainer}>
                <Text style={styles.devModeText}>Desarrollo: No se enviará email de confirmación</Text>
              </View>
            )}
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003F91', // Color azul oscuro como fondo
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 5,
    height: '100%',
    backgroundColor: '#076CD9', // Color azul brillante para la línea de acento
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#5DA9E9',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(93, 169, 233, 0.2)',
  },
  registerButton: {
    backgroundColor: '#5DA9E9',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#5DA9E980',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  devModeContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFA000',
  },
  devModeText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loginLink: {
    color: '#5DA9E9',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen; 