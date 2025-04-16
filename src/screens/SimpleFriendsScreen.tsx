import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase, DEV_MODE } from '../lib/supabase';
import debounce from 'lodash.debounce';

// Tipos
interface FriendRequest {
  id: string; // ID de la fila en la tabla friends
  sender_id: string;
  sender_username: string;
  sender_avatar_url?: string;
}

interface Friend {
  id: string; // ID del perfil del amigo
  username: string;
  avatar_url?: string;
}

interface SearchResult {
  id: string;
  username: string;
  avatar_url?: string;
}

const SimpleFriendsScreen = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]); // Solicitudes recibidas
  const [sentRequests, setSentRequests] = useState<string[]>([]); // IDs de usuarios a los que envié solicitud
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingRequest, setIsProcessingRequest] = useState<{[key: string]: boolean}>({}); // Para botones Aceptar/Rechazar
  const [isSendingRequest, setIsSendingRequest] = useState<{[key: string]: boolean}>({}); // Para botón Añadir

  // --- Funciones de Carga de Datos ---
  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await Promise.all([loadFriends(), loadPendingRequests(), loadSentRequests()]);
    } catch (error) {
      console.error("Error loading friends data:", error);
      Alert.alert("Error", "No se pudieron cargar los datos de amigos.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('friends')
      .select('friend_id, profiles:friend_id!inner ( id, username, avatar_url )')
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (error) throw error;
    const acceptedFriends = data?.map(f => f.profiles as Friend).filter((p): p is Friend => !!p) || [];
    setFriends(acceptedFriends);
  };

  const loadPendingRequests = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('friends')
      .select('id, sender_id:user_id, profiles:user_id!inner ( username, avatar_url )')
      .eq('friend_id', user.id)
      .eq('status', 'pending');

    if (error) throw error;
    const receivedRequests = data?.map(r => ({
      id: r.id,
      sender_id: r.sender_id,
      sender_username: (r.profiles as { username: string })?.username || 'Usuario Desconocido',
      sender_avatar_url: (r.profiles as { avatar_url?: string })?.avatar_url
    })).filter((p): p is FriendRequest => !!p) || [];
    setPendingRequests(receivedRequests);
  };

  const loadSentRequests = async () => {
      if (!user) return;
      const { data, error } = await supabase
          .from('friends')
          .select('friend_id')
          .eq('user_id', user.id)
          .eq('status', 'pending');

      if (error) throw error;
      const sentIds = data?.map((r: { friend_id: string }) => r.friend_id) || [];
      setSentRequests(sentIds);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Funciones de Búsqueda ---
  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (!query.trim() || !user) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      // Buscar usuarios que no sean yo, ni amigos actuales, ni con solicitudes pendientes
      const friendIds = friends.map(f => f.id);
      const pendingIds = pendingRequests.map(r => r.sender_id);
      const excludeIds = [...friendIds, ...pendingIds, ...sentRequests, user.id];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(10);

      if (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
      }
    } catch (error) {
      console.error("Search exception:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce para la búsqueda
  const debouncedSearch = useCallback(debounce(handleSearch, 300), [user, friends, pendingRequests, sentRequests]);

  useEffect(() => {
    debouncedSearch(searchTerm);
    // Cancelar debounce al desmontar
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  // --- Funciones de Amistad ---
  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;
    setIsSendingRequest(prev => ({ ...prev, [friendId]: true }));
    try {
      const { error } = await supabase
        .from('friends')
        .insert({ user_id: user.id, friend_id: friendId, status: 'pending' });

      if (error) {
        console.error("Error sending request:", error);
        Alert.alert("Error", "No se pudo enviar la solicitud.");
      } else {
        Alert.alert("Éxito", "Solicitud de amistad enviada.");
        setSentRequests(prev => [...prev, friendId]); // Añadir a sentRequests localmente
        setSearchResults(prev => prev.filter(u => u.id !== friendId)); // Quitar de resultados
      }
    } catch (error) {
        console.error("Send request exception:", error);
        Alert.alert("Error", "Ocurrió un error inesperado.");
    } finally {
      setIsSendingRequest(prev => ({ ...prev, [friendId]: false }));
    }
  };

  const handleFriendRequest = async (requestId: string, senderId: string, accept: boolean) => {
    if (!user) return;
    setIsProcessingRequest(prev => ({ ...prev, [requestId]: true }));
    try {
      if (accept) {
        // Actualizar la solicitud existente a 'accepted'
        const { error: updateError } = await supabase
          .from('friends')
          .update({ status: 'accepted' })
          .eq('id', requestId);
        
        if (updateError) throw updateError;

        // Crear la relación inversa (amigo -> usuario actual) con estado 'accepted'
        const { error: insertError } = await supabase
          .from('friends')
          .insert({ user_id: user.id, friend_id: senderId, status: 'accepted' });
        
        // Ignorar error si la relación inversa ya existe (UNIQUE constraint)
        if (insertError && insertError.code !== '23505') throw insertError;
        
        Alert.alert("Éxito", "Solicitud de amistad aceptada.");
      } else {
        // Rechazar: simplemente eliminar la solicitud
        const { error: deleteError } = await supabase
          .from('friends')
          .delete()
          .eq('id', requestId);
        
        if (deleteError) throw deleteError;
        Alert.alert("Info", "Solicitud de amistad rechazada.");
      }
      // Recargar datos después de la acción
      loadData();
    } catch (error) {
      console.error("Error handling request:", error);
      Alert.alert("Error", "No se pudo procesar la solicitud.");
    } finally {
      setIsProcessingRequest(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;
    Alert.alert(
      "Eliminar Amigo",
      "¿Estás seguro de que quieres eliminar a este amigo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            setIsProcessingRequest(prev => ({ ...prev, [friendId]: true }));
            try {
              // Eliminar ambas relaciones
              const { error: deleteError1 } = await supabase
                .from('friends')
                .delete()
                .match({ user_id: user.id, friend_id: friendId });
              
              if (deleteError1) throw deleteError1;

              const { error: deleteError2 } = await supabase
                .from('friends')
                .delete()
                .match({ user_id: friendId, friend_id: user.id });
              
              // Ignorar error si la segunda relación no existe
              if (deleteError2 && deleteError2.code !== 'PGRST116') {
                  console.warn("Error deleting reverse relationship (ignorable?):", deleteError2);
              }

              Alert.alert("Éxito", "Amigo eliminado.");
              loadData(); // Recargar lista de amigos
            } catch (error) {
              console.error("Error removing friend:", error);
              Alert.alert("Error", "No se pudo eliminar al amigo.");
            } finally {
                setIsProcessingRequest(prev => ({ ...prev, [friendId]: false }));
            }
          } 
        }
      ]
    );
  };

  // --- Render Functions ---
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="sad-outline" size={80} color="#CCCCCC" />
      <Text style={styles.emptyText}>
        Aún no tienes amigos. ¡Busca y añade a tus contactos para empezar!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <>
      {pendingRequests.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Solicitudes de Amistad</Text>
          <FlatList
            data={pendingRequests}
            keyExtractor={(item) => item.id}
            renderItem={renderRequestItem}
            scrollEnabled={false} // Para evitar scroll anidado
          />
        </View>
      )}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Mis Amigos ({friends.length})</Text>
      </View>
    </>
  );

  const renderFooter = () => (
    friends.length === 0 && pendingRequests.length === 0 ? renderEmptyComponent() : null
  );

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.listItemContainer}>
      <Image 
        source={{ uri: item.avatar_url || 'https://picsum.photos/seed/default/100' }} 
        style={styles.avatar} 
      />
      <Text style={styles.username}>{item.username}</Text>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => removeFriend(item.id)}
        disabled={isProcessingRequest[item.id]}
      >
        {isProcessingRequest[item.id] ? 
          <ActivityIndicator size="small" color="#FFFFFF" /> : 
          <Ionicons name="person-remove-outline" size={20} color="#FFFFFF" />
        }
      </TouchableOpacity>
    </View>
  );

  const renderRequestItem = ({ item }: { item: FriendRequest }) => (
    <View style={styles.listItemContainer}>
      <Image 
        source={{ uri: item.sender_avatar_url || 'https://picsum.photos/seed/default/100' }} 
        style={styles.avatar} 
      />
      <Text style={styles.username}>{item.sender_username}</Text>
      <View style={styles.requestButtonsContainer}>
        <TouchableOpacity 
          style={[styles.requestButton, styles.acceptButton]} 
          onPress={() => handleFriendRequest(item.id, item.sender_id, true)}
          disabled={isProcessingRequest[item.id]}
        >
          {isProcessingRequest[item.id] ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.requestButton, styles.rejectButton]} 
          onPress={() => handleFriendRequest(item.id, item.sender_id, false)}
          disabled={isProcessingRequest[item.id]}
        >
           {isProcessingRequest[item.id] ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="close" size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResultItem = ({ item }: { item: SearchResult }) => (
    <View style={styles.listItemContainer}>
      <Image 
        source={{ uri: item.avatar_url || 'https://picsum.photos/seed/default/100' }} 
        style={styles.avatar} 
      />
      <Text style={styles.username}>{item.username}</Text>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => sendFriendRequest(item.id)}
        disabled={isSendingRequest[item.id]}
      >
         {isSendingRequest[item.id] ? 
          <ActivityIndicator size="small" color="#FFFFFF" /> : 
          <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
         }
      </TouchableOpacity>
    </View>
  );

  // --- Component Return ---
  return (
    <View style={styles.container}>
      {/* Barra de Búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#CCCCCC" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar amigos..."
          placeholderTextColor="#CCCCCC"
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => { setSearchTerm(''); Keyboard.dismiss(); }}>
            <Ionicons name="close-circle" size={20} color="#CCCCCC" style={styles.clearIcon} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Resultados de Búsqueda o Lista Principal */}
      {searchTerm.trim() ? (
        <View style={styles.listContainer}>
          {isSearching ? (
            <ActivityIndicator color="#FFFFFF" style={{marginTop: 20}}/>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResultItem}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <Text style={styles.noResultsText}>No se encontraron usuarios.</Text>
          )}
        </View>
      ) : (
        <View style={styles.listContainer}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" style={{marginTop: 50}}/>
          ) : (
            <FlatList
              data={friends} // Solo mostrar amigos aceptados aquí
              keyExtractor={(item) => item.id}
              renderItem={renderFriendItem}
              ListHeaderComponent={renderHeader} // Muestra solicitudes y título "Mis Amigos"
              ListFooterComponent={renderFooter} // Muestra estado vacío si aplica
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003F91', // Fondo azul oscuro
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearIcon: {
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    backgroundColor: '#5DA9E9', // Placeholder color
  },
  username: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  requestButtonsContainer: {
    flexDirection: 'row',
  },
  requestButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50', // Verde
  },
  rejectButton: {
    backgroundColor: '#F44336', // Rojo
  },
  addButton: {
      backgroundColor: '#5DA9E9', // Azul claro
      padding: 8,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
  },
  removeButton: {
      backgroundColor: '#F44336', // Rojo
      padding: 8,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50, // Ajustar para centrar mejor
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
  },
  noResultsText: {
    color: '#CCCCCC',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  },
});

export default SimpleFriendsScreen; 