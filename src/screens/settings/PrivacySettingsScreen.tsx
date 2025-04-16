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

const PrivacySettingsScreen = () => {
  const { privacy, updatePrivacyPreferences, loading } = useUserPreferences();
  const [saving, setSaving] = useState(false);
  const [localPrivacySettings, setLocalPrivacySettings] = useState(() => {
    const { photoVisibility, ...rest } = privacy;
    return rest;
  });

  useEffect(() => {
    const { photoVisibility, ...rest } = privacy;
    setLocalPrivacySettings(rest);
  }, [privacy]);

  const saveChanges = async () => {
    setSaving(true);
    try {
      const settingsToSave = { ...localPrivacySettings };
      await updatePrivacyPreferences(settingsToSave);
      Alert.alert('Éxito', 'Preferencias de privacidad actualizadas.');
    } catch (error) {
      console.error('Error actualizando preferencias:', error);
      Alert.alert('Error', 'No se pudo actualizar las preferencias.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (setting: keyof Omit<typeof localPrivacySettings, 'photoVisibility'>) => {
    if (typeof localPrivacySettings[setting] !== 'boolean') return;
    setLocalPrivacySettings({
      ...localPrivacySettings,
      [setting]: !localPrivacySettings[setting]
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de perfil</Text>
          <Text style={styles.sectionDescription}>
            Controla aspectos de tu perfil público
          </Text>
          
          <View style={styles.settingItemContainer}>
            <View style={styles.settingItemIcon}>
              <Ionicons name="person-circle" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemHeader}>
                <View style={styles.settingItemTextContainer}>
                  <Text style={styles.settingItemTitle}>Perfil público</Text>
                  <Text style={styles.settingItemDescription}>
                    Tu perfil será visible para otros usuarios
                  </Text>
                </View>
                <Switch
                  value={localPrivacySettings.profileVisibility}
                  onValueChange={() => toggleSetting('profileVisibility')}
                  trackColor={{ false: '#767577', true: '#5DA9E9' }}
                  thumbColor="#FFFFFF"
                  disabled={loading || saving}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.settingItemContainer}>
            <View style={styles.settingItemIcon}>
              <Ionicons name="radio" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.settingItemContent}>
              <View style={styles.settingItemHeader}>
                <View style={styles.settingItemTextContainer}>
                  <Text style={styles.settingItemTitle}>Estado en línea</Text>
                  <Text style={styles.settingItemDescription}>
                    Mostrar cuándo estás activo en la app
                  </Text>
                </View>
                <Switch
                  value={localPrivacySettings.onlineStatus}
                  onValueChange={() => toggleSetting('onlineStatus')}
                  trackColor={{ false: '#767577', true: '#5DA9E9' }}
                  thumbColor="#FFFFFF"
                  disabled={loading || saving}
                />
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#CCCCCC" />
          <Text style={styles.infoText}>
            Cambiar tu configuración de privacidad afectará la forma en que los demás 
            pueden interactuar contigo, pero no afectará las interacciones existentes con tus amigos.
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
  settingItemContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  settingItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingItemTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingItemDescription: {
    fontSize: 12,
    color: '#CCCCCC',
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
    borderRadius: 10,
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

export default PrivacySettingsScreen; 