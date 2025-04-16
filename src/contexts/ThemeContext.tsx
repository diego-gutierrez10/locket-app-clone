import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for theme colors
export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  error: string;
}

// Define available themes
export const themes = {
  light: {
    primary: '#003F91',   // Blue primary
    background: '#FFFFFF', // White background
    surface: '#F0F0F0',    // Light gray surface
    text: '#000000',       // Black text
    textSecondary: '#666666', // Gray text
    accent: '#5DA9E9',     // Light blue accent
    error: '#FF4747'       // Red for errors
  },
  dark: {
    primary: '#003F91',    // Keep blue primary for brand consistency
    background: '#121212', // Dark background
    surface: '#242424',    // Dark gray surface
    text: '#FFFFFF',       // White text
    textSecondary: '#BBBBBB', // Light gray text
    accent: '#5DA9E9',     // Light blue accent
    error: '#FF6B6B'       // Slightly lighter red for errors
  }
};

// Theme context type
type ThemeContextType = {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  setIsSystemTheme: (value: boolean) => void;
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [isSystemTheme, setIsSystemTheme] = useState(false);
  
  // Load saved theme on component mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Load theme preference from storage
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      const systemTheme = await AsyncStorage.getItem('useSystemTheme');
      
      if (systemTheme === 'true') {
        setIsSystemTheme(true);
        // If using system theme, we would get it from the device
        // For now, default to light theme
        setThemeState('light');
      } else if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  // Save theme preference to storage
  const saveThemePreference = async (newTheme: 'light' | 'dark') => {
    try {
      await AsyncStorage.setItem('themePreference', newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const saveSystemThemePreference = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('useSystemTheme', value.toString());
    } catch (error) {
      console.error('Error saving system theme preference:', error);
    }
  };

  // Function to change theme
  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    saveThemePreference(newTheme);
    setIsSystemTheme(false);
    saveSystemThemePreference(false);
  };

  // Function to toggle between themes
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Update system theme preference
  const updateIsSystemTheme = (value: boolean) => {
    setIsSystemTheme(value);
    saveSystemThemePreference(value);
    // In a real implementation, we would subscribe to system theme changes
    // For now, default to light if system theme is selected
    if (value) {
      setThemeState('light');
    }
  };

  // Get current theme colors
  const colors = themes[theme];

  // Context value
  const contextValue = {
    theme,
    colors,
    setTheme,
    toggleTheme,
    isSystemTheme,
    setIsSystemTheme: updateIsSystemTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 