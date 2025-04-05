import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { supabase, DEV_MODE } from '../lib/supabase';
import { randomUUID } from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const CameraScreen = () => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const { user } = useAuth();

  // Solicitar permisos de cámara cuando el componente se monte
  useEffect(() => {
    if (isFocused) {
      requestCameraPermission();
    }
  }, [isFocused]);

  // Solicitar permisos para usar la cámara
  const requestCameraPermission = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a tu cámara para tomar fotos.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error al solicitar permisos de cámara:', error);
    }
  };

  // Tomar una foto usando la cámara
  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        // No se usa flashMode porque no es una propiedad válida en la versión actual
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Por favor intenta de nuevo.');
    }
  };

  // Cambiar el estado del flash
  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  // Función para volver atrás
  const goBack = () => {
    navigation.goBack();
  };

  // Función para descartar la foto y volver a la cámara
  const discardPhoto = () => {
    setPhotoUri(null);
  };

  // Función para subir la foto a Supabase
  const uploadPhoto = async () => {
    if (!photoUri || !user) {
      Alert.alert('Error', 'No se puede compartir la foto en este momento.');
      return;
    }
    
    setUploading(true);
    
    try {
      // Generar un nombre de archivo único
      const fileExt = photoUri.split('.').pop();
      const fileName = `${randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // En modo desarrollo, simulamos que la carga fue exitosa
      if (DEV_MODE) {
        console.log('Modo desarrollo: Simulando carga de foto exitosa');
        
        // Simular un delay para hacer la experiencia más realista
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        Alert.alert('¡Éxito!', 'Tu foto ha sido compartida con tus amigos.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        
        return;
      }
      
      // Convertir la foto a blob
      const response = await fetch(photoUri);
      const blob = await response.blob();
      
      // Subir la foto a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, blob);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Obtener la URL pública de la foto
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);
      
      if (!data || !data.publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la foto');
      }
      
      // Crear un nuevo post en la base de datos
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: data.publicUrl,
        });
      
      if (postError) {
        throw postError;
      }
      
      Alert.alert('¡Éxito!', 'Tu foto ha sido compartida con tus amigos.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error al subir foto:', error);
      Alert.alert('Error', 'No se pudo compartir la foto. Por favor intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  // Si el componente no está enfocado, no renderizamos nada
  if (!isFocused) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {photoUri ? (
        // Mostrar la foto tomada
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          
          <View style={styles.previewActions}>
            {uploading ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.previewButton, styles.discardButton]} 
                  onPress={discardPhoto}
                >
                  <Text style={styles.buttonText}>Descartar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.previewButton, styles.uploadButton]} 
                  onPress={uploadPhoto}
                >
                  <Text style={styles.buttonText}>Compartir</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      ) : (
        // Mostrar interfaz de cámara
        <View style={styles.cameraContainer}>
          {/* Header con controles */}
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={goBack}>
              <Text style={styles.headerText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={toggleFlash}>
              <Text style={styles.headerText}>
                {flashEnabled ? 'Flash: ON' : 'Flash'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Vista previa de cámara (simulada) */}
          <View style={styles.cameraPreview} />
          
          {/* Botón de captura */}
          <View style={styles.captureContainer}>
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003F91', // Color azul del fondo
  },
  cameraContainer: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#03304A', // Color de la vista previa según el diseño
  },
  captureContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#5DA9E9', // Color azul claro del botón interno
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  previewButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  discardButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
  },
  uploadButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraScreen; 