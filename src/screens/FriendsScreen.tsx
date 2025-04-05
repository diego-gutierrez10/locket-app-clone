import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { supabase, DEV_MODE } from '../lib/supabase';
import { randomUUID } from 'expo-crypto';

// Definir el tipo para los amigos
type Friend = {
  id: string;
  username: string;
  avatar_url: string;
  status?: string;
  last_active?: string;
};

const FriendsScreen = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation();
  const { user } = useAuth();

  // Cargar amigos cuando el componente se monta
  useEffect(() => {
    // Cargar inmediatamente al iniciar
    fetchFriends();
    
    // Simular un proceso de carga más realista en modo desarrollo
    if (DEV_MODE) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, []);

  // Función para obtener la lista de amigos
  const fetchFriends = async () => {
    try {
      setRefreshing(true);
      
      // Generar amigos de prueba en modo desarrollo
      const mockFriends = generateMockFriends(5);
      setFriends(mockFriends);
      
    } catch (error) {
      console.error('Error al obtener amigos:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Función para generar amigos de prueba
  const generateMockFriends = (count: number): Friend[] => {
    const mockFriends: Friend[] = [];
    const friendNames = [
      'Laura Martínez', 
      'Carlos Rodríguez', 
      'Ana García', 
      'Miguel López', 
      'Sofia Fernández',
      'Diego Sánchez',
      'Elena Torres'
    ];
    
    for (let i = 0; i < count; i++) {
      mockFriends.push({
        id: randomUUID(),
        username: friendNames[i % friendNames.length],
        avatar_url: `https://i.pravatar.cc/150?img=${i + 10}`,
        status: i % 3 === 0 ? 'Online' : 'Offline',
        last_active: new Date(Date.now() - i * 1000 * 60 * 60 * (i + 1)).toISOString()
      });
    }
    
    return mockFriends;
  };

  // Función para añadir un nuevo amigo
  const handleAddFriend = () => {
    Alert.alert(
      'Añadir amigo',
      'Esta función permitirá buscar y añadir amigos en una versión futura.',
      [{ text: 'OK' }]
    );
  };

  // Función para mostrar el estado del amigo
  const getStatusText = (friend: Friend) => {
    if (friend.status === 'Online') {
      return 'Online';
    } else {
      // Calcular tiempo desde última conexión
      const lastActive = new Date(friend.last_active || Date.now());
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) {
        return 'Hace menos de una hora';
      } else if (diffHours < 24) {
        return `Hace ${diffHours} horas`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        return `Hace ${diffDays} días`;
      }
    }
  };

  // Función para renderizar cada amigo
  const renderFriend = ({ item }: { item: Friend }) => {
    return (
      <TouchableOpacity
        style={styles.friendItem}
        activeOpacity={0.8}
        onPress={() => handleFriendPress(item)}
      >
        <Image
          source={{ uri: item.avatar_url }}
          style={styles.avatar}
        />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.username}</Text>
          <Text style={[
            styles.friendStatus, 
            item.status === 'Online' ? styles.statusOnline : styles.statusOffline
          ]}>
            {getStatusText(item)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Función para manejar el clic en un amigo
  const handleFriendPress = (friend: Friend) => {
    Alert.alert(
      `Amigo: ${friend.username}`,
      'Función de chat disponible próximamente',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Mensaje de depuración */}
      <View style={styles.debugBox}>
        <Text style={styles.debugText}>PANTALLA DE AMIGOS CARGADA</Text>
      </View>
      
      {/* Línea de acento vertical */}
      <View style={styles.accentLine} />
      
      {/* Barra superior */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity onPress={handleAddFriend}>
          <Text style={styles.addButton}>Add</Text>
        </TouchableOpacity>
      </View>
      
      {/* Lista de amigos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5DA9E9" />
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchFriends}
              colors={['#5DA9E9']}
              tintColor="#FFFFFF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes amigos todavía</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={handleAddFriend}
              >
                <Text style={styles.emptyButtonText}>Añadir amigos</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003F91', // Color azul oscuro del fondo
  },
  debugBox: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'red',
    zIndex: 999,
  },
  debugText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#5DA9E9', // Color azul claro para el header
    paddingTop: 50, // Ajuste para que esté por debajo del status bar
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C987D', // Color verde para el botón Add
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 5,
    height: '100%',
    backgroundColor: '#0480D0', // Color azul del acento
    zIndex: 10, // Asegurarse de que la línea esté por encima de todo
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 10,
  },
  friendItem: {
    backgroundColor: 'rgba(40, 102, 110, 0.4)', // Color semi-transparente para los items
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    height: 70,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 14,
  },
  statusOnline: {
    color: '#7ED957', // Verde para online
  },
  statusOffline: {
    color: '#BBBBBB', // Gris para offline
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#5DA9E9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FriendsScreen; 