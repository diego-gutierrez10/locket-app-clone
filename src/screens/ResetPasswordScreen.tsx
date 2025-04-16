import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext'; // Podríamos necesitar signOut
import { useNavigation } from '@react-navigation/native';

// Simular tipo de navegación si es necesario, o importar desde index
type NavigationProp = {
  navigate: (screen: string) => void;
  goBack: () => void;
  // Añade otros métodos si los usas
};

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const { signOut } = useAuth(); // Para cerrar sesión después de actualizar

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Por favor ingresa y confirma la nueva contraseña.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
        Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    setIsLoading(true);
    try {
      // El usuario ya está en el estado de recuperación por haber hecho clic en el enlace
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("Error updating password:", error);
        Alert.alert("Error", error.message || "No se pudo actualizar la contraseña.");
      } else {
        Alert.alert(
          "Éxito", 
          "Tu contraseña ha sido actualizada. Por favor, inicia sesión de nuevo.",
          [
            { text: "OK", onPress: async () => {
                // Forzar cierre de sesión por si acaso y navegar a Login
                await signOut();
                // Navegar a Login (asumiendo que está en el stack Auth)
                navigation.navigate('Login'); 
            }}
          ]
        );
      }
    } catch (err) {
      console.error("Exception updating password:", err);
      Alert.alert("Error", "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Restablecer Contraseña</Text>
        <Text style={styles.subtitle}>Ingresa tu nueva contraseña a continuación.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nueva Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña (mín. 6 caracteres)"
            placeholderTextColor="#FFFFFF70"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirma la nueva contraseña"
            placeholderTextColor="#FFFFFF70"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Guardar Nueva Contraseña</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003F91', 
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60, 
    paddingBottom: 20,
  },
  title: {
    fontSize: 28, 
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 40,
    textAlign: 'center',
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
  button: {
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
});

export default ResetPasswordScreen; 