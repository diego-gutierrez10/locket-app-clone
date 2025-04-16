import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import FeedScreen from '../screens/FeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CameraScreen from '../screens/CameraScreen';
// import FriendsScreen from '../screens/FriendsScreen';
import SimpleFriendsScreen from '../screens/SimpleFriendsScreen';
// import SettingsNavigator from './SettingsNavigator';
import SettingsMainScreen from '../screens/settings/SettingsMainScreen';
import UploadScreen from '../screens/UploadScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Upload') {
            iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          // @ts-ignore
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
        options={{
          title: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{
          title: 'Cámara',
        }}
      />
      <Tab.Screen 
        name="Upload" 
        component={UploadScreen} 
        options={{
          title: 'Subir',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsMainScreen} 
        options={{
          title: 'Configuración',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 