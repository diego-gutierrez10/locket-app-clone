import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';

// Componente para la selección de sonido
const SoundSelector = ({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: string; 
  onChange: (value: 'default' | 'silent' | 'vibrate') => void; 
  disabled: boolean;
}) => {
  const options = [
    { value: 'default', label: 'Sonido predeterminado', icon: 'musical-note' },
    { value: 'silent', label: 'Silencioso', icon: 'volume-mute' },
    { value: 'vibrate', label: 'Solo vibración', icon: 'phone-portrait' }
  ];

  return (
    <View style={styles.soundSelectorContainer}>
      {options.map(option => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.soundOption,
            value === option.value && styles.soundOptionSelected,
            disabled && styles.soundOptionDisabled
          ]}
          onPress={() => onChange(option.value as 'default' | 'silent' | 'vibrate')}
          disabled={disabled}
        >
          <Ionicons name={option.icon as any} size={24} color="#FFFFFF" />
          <Text style={styles.soundOptionLabel}>{option.label}</Text>
          {value === option.value && (
            <Ionicons name="checkmark-circle" size={18} color="#5DA9E9" style={styles.checkIcon} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const NotificationPrefsScreen = () => {
  const { notifications, updateNotificationPreferences, loading } = useUserPreferences();
  const [saving, setSaving] = useState(false);
  const [localNotificationSettings, setLocalNotificationSettings] = useState(notifications);

  // Actualizar configuración local cuando la configuración global cambia
  useEffect(() => {
    setLocalNotificationSettings(notifications);
  }, [notifications]);

  // Función para actualizar el backend con los cambios locales
  const saveChanges = async () => {
    setSaving(true);
    
    try {
      await updateNotificationPreferences(localNotificationSettings);
      Alert.alert('Éxito', 'Preferencias de notificaciones actualizadas correctamente.');
    } catch (error) {
      console.error('Error al actualizar las preferencias de notificaciones:', error);
      Alert.alert('Error', 'No se pudo actualizar las preferencias de notificaciones. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Función para cambiar un toggle de notificación
  const toggleNotification = (setting: keyof typeof localNotificationSettings) => {
    if (typeof localNotificationSettings[setting] !== 'boolean') return;
    
    setLocalNotificationSettings({
      ...localNotificationSettings,
      [setting]: !localNotificationSettings[setting]
    });
  };

  // Función para cambiar el sonido de notificación
  const setSoundPreference = (sound: 'default' | 'silent' | 'vibrate') => {
    setLocalNotificationSettings({
      ...localNotificationSettings,
      sound
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones push</Text>
          <Text style={styles.sectionDescription}>
            Elige qué notificaciones quieres recibir
          </Text>
          
          <View style={styles.notificationItemContainer}>
            <View style={styles.notificationItemIcon}>
              <Ionicons name="image" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.notificationItemContent}>
              <View style={styles.notificationItemHeader}>
                <View style={styles.notificationItemTextContainer}>
                  <Text style={styles.notificationItemTitle}>Nuevas fotos</Text>
                  <Text style={styles.notificationItemDescription}>
                    Notificaciones cuando tus amigos publican nuevas fotos
                  </Text>
                </View>
                <Switch
                  value={localNotificationSettings.newPhotos}
                  onValueChange={() => toggleNotification('newPhotos')}
                  trackColor={{ false: '#767577', true: '#5DA9E9' }}
                  thumbColor="#FFFFFF"
                  disabled={loading || saving}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.notificationItemContainer}>
            <View style={styles.notificationItemIcon}>
              <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.notificationItemContent}>
              <View style={styles.notificationItemHeader}>
                <View style={styles.notificationItemTextContainer}>
                  <Text style={styles.notificationItemTitle}>Mensajes</Text>
                  <Text style={styles.notificationItemDescription}>
                    Notificaciones de nuevos mensajes y reacciones
                  </Text>
                </View>
                <Switch
                  value={localNotificationSettings.messages}
                  onValueChange={() => toggleNotification('messages')}
                  trackColor={{ false: '#767577', true: '#5DA9E9' }}
                  thumbColor="#FFFFFF"
                  disabled={loading || saving}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.notificationItemContainer}>
            <View style={styles.notificationItemIcon}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.notificationItemContent}>
              <View style={styles.notificationItemHeader}>
                <View style={styles.notificationItemTextContainer}>
                  <Text style={styles.notificationItemTitle}>Solicitudes de amistad</Text>
                  <Text style={styles.notificationItemDescription}>
                    Notificaciones de nuevas solicitudes de amistad
                  </Text>
                </View>
                <Switch
                  value={localNotificationSettings.friendRequests}
                  onValueChange={() => toggleNotification('friendRequests')}
                  trackColor={{ false: '#767577', true: '#5DA9E9' }}
                  thumbColor="#FFFFFF"
                  disabled={loading || saving}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.notificationItemContainer}>
            <View style={styles.notificationItemIcon}>
              <Ionicons name="logo-npm" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.notificationItemContent}>
              <View style={styles.notificationItemHeader}>
                <View style={styles.notificationItemTextContainer}>
                  <Text style={styles.notificationItemTitle}>Actualizaciones de la app</Text>
                  <Text style={styles.notificationItemDescription}>
                    Notificaciones sobre nuevas características y actualizaciones
                  </Text>
                </View>
                <Switch
                  value={localNotificationSettings.appUpdates}
                  onValueChange={() => toggleNotification('appUpdates')}
                  trackColor={{ false: '#767577', true: '#5DA9E9' }}
                  thumbColor="#FFFFFF"
                  disabled={loading || saving}
                />
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sonidos de notificación</Text>
          <Text style={styles.sectionDescription}>
            Elige cómo sonará tu dispositivo al recibir notificaciones
          </Text>
          
          <SoundSelector
            value={localNotificationSettings.sound}
            onChange={setSoundPreference}
            disabled={loading || saving}
          />
        </View>
        
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#CCCCCC" />
          <Text style={styles.infoText}>
            Las notificaciones push pueden ser administradas también desde la configuración 
            de tu dispositivo. La aplicación respetará la configuración global de notificaciones.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, (loading || saving) && styles.saveButtonDisabled]}
          onPress={saveChanges}
          disabled={loading || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  notificationItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  notificationItemIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 15,
  },
  notificationItemContent: {
    flex: 1,
  },
  notificationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationItemTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  notificationItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationItemDescription: {
    fontSize: 13,
    color: '#CCCCCC',
  },
  soundSelectorContainer: {
    marginTop: 10,
  },
  soundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10,
  },
  soundOptionSelected: {
    backgroundColor: 'rgba(93,169,233,0.2)',
    borderColor: '#5DA9E9',
    borderWidth: 1,
  },
  soundOptionDisabled: {
    opacity: 0.5,
  },
  soundOptionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
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

export default NotificationPrefsScreen; 