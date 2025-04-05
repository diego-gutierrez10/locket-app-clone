import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  const { user } = useAuth();
  console.log("Estado actual de la autenticación:", user ? "Autenticado" : "No autenticado");

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={user ? 'Main' : 'Auth'}
        screenOptions={{ headerShown: false }}
      >
        {user ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 