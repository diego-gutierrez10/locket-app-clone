import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
  const { userProfile, updateProfile, uploadAvatar, profileLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para los campos del formulario
  const [username, setUsername] = useState('');
  const [full_name, setFullName] = useState('');
  const [bio, setBio] = useState('');
  
  // Cargar datos del perfil cuando el componente se monta
  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
      setFullName(userProfile.full_name || '');
      setBio(userProfile.bio || '');
    }
  }, [userProfile]);
  
  // Función para manejar la actualización del avatar
  const handleUpdateAvatar = async () => {
    try {
      const result = await uploadAvatar();
      
      if (result.success) {
        Alert.alert('Éxito', 'Tu foto de perfil ha sido actualizada correctamente.');
      } else if (!result.success) {
        Alert.alert('Error', 'No se pudo actualizar tu foto de perfil. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar tu foto de perfil.');
    }
  };
  
  // Función para manejar la actualización del perfil
  const handleUpdateProfile = async () => {
    if (isSubmitting) return;
    
    // Validar campo de usuario
    if (!username.trim()) {
      Alert.alert('Error', 'El nombre de usuario es obligatorio.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await updateProfile({
        username: username.trim(),
        full_name: full_name.trim(),
        bio: bio.trim()
      });
      
      if (result.success) {
        Alert.alert('Éxito', 'Tu perfil ha sido actualizado correctamente.');
      } else {
        Alert.alert('Error', 'No se pudo actualizar tu perfil. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar tu perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {userProfile?.avatar_url ? (
              <Image 
                source={{ uri: userProfile.avatar_url }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={60} color="#FFFFFF" />
              </View>
            )}
            {profileLoading && (
              <View style={styles.avatarLoading}>
                <ActivityIndicator color="#FFFFFF" size="large" />
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.changeAvatarButton}
            onPress={handleUpdateAvatar}
            disabled={profileLoading}
          >
            <Text style={styles.changeAvatarText}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>Nombre de usuario</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Nombre de usuario"
            placeholderTextColor="#A0A0A0"
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={full_name}
            onChangeText={setFullName}
            placeholder="Tu nombre completo"
            placeholderTextColor="#A0A0A0"
          />
          
          <Text style={styles.label}>Biografía</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Cuéntanos sobre ti..."
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, (isSubmitting || profileLoading) && styles.saveButtonDisabled]} 
          onPress={handleUpdateProfile}
          disabled={isSubmitting || profileLoading}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003F91',
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    backgroundColor: '#5DA9E9',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#5DA9E9',
  },
  changeAvatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  formSection: {
    paddingHorizontal: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#FFFFFF',
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  saveButton: {
    backgroundColor: '#5DA9E9',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen; 