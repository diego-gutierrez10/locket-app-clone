import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

// Vista previa para cada tema
const ThemePreview = ({ theme, selected, onSelect }: {
  theme: 'light' | 'dark';
  selected: boolean;
  onSelect: () => void;
}) => {
  // Colores para cada tema
  const colors = theme === 'light' 
    ? { bg: '#FFFFFF', text: '#000000', surface: '#F0F0F0', primary: '#003F91' }
    : { bg: '#121212', text: '#FFFFFF', surface: '#242424', primary: '#003F91' };

  return (
    <TouchableOpacity 
      style={[
        styles.themePreviewContainer,
        { backgroundColor: colors.bg },
        selected && styles.themePreviewSelected
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.previewHeader}>
        <View style={[styles.previewStatusBar, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#FFFFFF', fontSize: 10 }}>
            {theme === 'light' ? 'Modo Claro' : 'Modo Oscuro'}
          </Text>
        </View>
      </View>
      <View style={styles.previewContent}>
        <View style={[styles.previewSurface, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, fontSize: 10 }}>Vista previa</Text>
        </View>
        <View style={[styles.previewButton, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#FFFFFF', fontSize: 10 }}>Botón</Text>
        </View>
      </View>
      {selected && (
        <View style={styles.selectedIcon}>
          <Ionicons name="checkmark-circle" size={24} color="#5DA9E9" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const AppThemeScreen = () => {
  const { theme, setTheme, isSystemTheme, setIsSystemTheme } = useTheme();
  const deviceTheme = useColorScheme() as 'light' | 'dark' | null;
  
  // Función para mostrar el nombre del tema
  const getThemeName = () => {
    if (isSystemTheme) {
      return 'Sistema (' + (deviceTheme || 'claro') + ')';
    }
    return theme === 'light' ? 'Claro' : 'Oscuro';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tema actual</Text>
        <Text style={styles.currentTheme}>{getThemeName()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seleccionar tema</Text>
        <View style={styles.themePreviewsContainer}>
          <ThemePreview 
            theme="light" 
            selected={!isSystemTheme && theme === 'light'} 
            onSelect={() => {
              setTheme('light');
            }}
          />
          <ThemePreview 
            theme="dark" 
            selected={!isSystemTheme && theme === 'dark'} 
            onSelect={() => {
              setTheme('dark');
            }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.optionRow}>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Usar tema del sistema</Text>
            <Text style={styles.optionDescription}>
              La aplicación se adaptará automáticamente al tema de tu dispositivo
            </Text>
          </View>
          <Switch
            value={isSystemTheme}
            onValueChange={setIsSystemTheme}
            trackColor={{ false: '#767577', true: '#5DA9E9' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Ionicons name="information-circle-outline" size={20} color="#CCCCCC" />
        <Text style={styles.infoText}>
          Al seleccionar "Usar tema del sistema", la app cambiará automáticamente 
          entre modo claro y oscuro según la configuración de tu dispositivo.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003F91',
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
    marginBottom: 15,
  },
  currentTheme: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  themePreviewsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  themePreviewContainer: {
    width: '48%',
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  themePreviewSelected: {
    borderColor: '#5DA9E9',
    borderWidth: 2,
  },
  previewHeader: {
    height: 30,
  },
  previewStatusBar: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  previewSurface: {
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  previewButton: {
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  selectedIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: 20,
  },
  optionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionDescription: {
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
});

export default AppThemeScreen; 