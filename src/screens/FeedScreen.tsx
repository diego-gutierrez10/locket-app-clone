import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator, 
  Dimensions,
  Alert,
  Modal,
  Platform,
  FlatList,
  Animated,
  TextInput,
  StatusBar,
  KeyboardAvoidingView
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase, DEV_MODE } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { randomUUID } from 'expo-crypto';
import { useNavigation } from '@react-navigation/native';

// Importar tipos específicos
import { NavigationProp } from '@react-navigation/native';

// Definir el tipo para la pila de navegación (ajusta según tu estructura)
type RootStackParamList = {
  Auth: undefined;
  Main: { screen?: string }; // Añadimos parámetro opcional 'screen'
  Feed: undefined;
  Camera: undefined;
  Friends: undefined;
  Settings: undefined; 
  // ... otras rutas
};

// Tipo genérico para useNavigation, getParent devolverá el tipo correcto
type FeedScreenNavigationProp = NavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');
// Tamaño de la foto (cuadrada)
const PHOTO_SIZE = width * 0.9; // Aumentamos un poco el tamaño de la foto
// Color de fondo azul
const BACKGROUND_COLOR = '#003F91';

interface Post {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  username: string;
  avatar_url?: string;
}

const FeedScreen = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false); // Estado para indicar envío
  const flatListRef = useRef<FlatList>(null);
  // Usar el tipo genérico ahora
  const navigation = useNavigation<FeedScreenNavigationProp>();

  // Animation references
  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchPosts = async () => {
    if (refreshing) return;
    
    setLoading(true);
    try {
      // Aquí obtenemos posts reales desde Supabase
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          image_url,
          created_at,
          profiles (username, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
        // Si estamos en modo desarrollo, generamos datos de prueba en caso de error
        if (DEV_MODE) {
          console.log('Modo desarrollo: Generando posts de prueba');
          setPosts(generateMockPosts());
        }
        return;
      }
      
      // Usar datos de prueba si no hay datos reales
      if (!data || data.length === 0) {
        console.log('No se encontraron posts, mostrando datos de prueba');
        const mockPosts = generateMockPosts();
        setPosts(mockPosts);
      } else {
        // Transformar los datos para nuestro formato
        const formattedPosts = data.map(post => {
          // Extraemos los datos del perfil de manera segura
          const profileData = post.profiles as unknown;
          let username = 'Usuario';
          let avatar_url: string | undefined = undefined;
          
          // Verificamos si profiles tiene los datos que necesitamos
          if (profileData && typeof profileData === 'object') {
            if ('username' in profileData && typeof profileData.username === 'string') {
              username = profileData.username;
            }
            if ('avatar_url' in profileData && typeof profileData.avatar_url === 'string') {
              avatar_url = profileData.avatar_url;
            }
          }
          
          return {
            id: post.id,
            user_id: post.user_id,
            image_url: post.image_url,
            created_at: post.created_at,
            username,
            avatar_url
          };
        });
        
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      if (DEV_MODE) {
        console.log('Modo desarrollo: Generando posts de prueba después de error');
        setPosts(generateMockPosts());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Generar datos de prueba para demostración con imágenes más dinámicas
  const generateMockPosts = (): Post[] => {
    return [
      {
        id: '1',
        user_id: '1',
        username: 'Paloma',
        image_url: 'https://picsum.photos/800/800?random=1',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paloma'
      },
      {
        id: '2',
        user_id: '2',
        username: 'Carlos',
        image_url: 'https://picsum.photos/800/800?random=2',
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
      },
      {
        id: '3',
        user_id: '3',
        username: 'María',
        image_url: 'https://picsum.photos/800/800?random=3',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
      },
      {
        id: '4',
        user_id: '4',
        username: 'Diego',
        image_url: 'https://picsum.photos/800/800?random=4',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego'
      }
    ];
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  // Formatea la fecha para mostrar hace cuánto tiempo se publicó la foto
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    
    // Si es en formato DD de mes
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short' 
    };
    
    return date.toLocaleDateString('es-ES', options).toLowerCase();
  };

  // Función para manejar cuando cambia la imagen visible
  const handleViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  // Configuración para determinar cuándo un item es visible
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  // Referencia al configurationn de viewability
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged: handleViewableItemsChanged }
  ]);

  // Función para enviar un mensaje o reacción
  const sendMessage = async (reactionEmoji?: string) => {
    if (isSending) return; // Evitar envíos múltiples

    const currentPost = posts[currentIndex];
    if (!currentPost || !user) {
      console.warn('No hay post actual o usuario no autenticado.');
      return;
    }

    const senderId = user.id;
    const postId = currentPost.id;
    const receiverId = currentPost.user_id;

    setIsSending(true);

    try {
      if (reactionEmoji) {
        // Es una reacción
        console.log(`Enviando reacción ${reactionEmoji} al post ${postId} por ${senderId}`);
        const { error } = await supabase
          .from('reactions')
          .upsert({
            post_id: postId,
            user_id: senderId,
            emoji: reactionEmoji,
          }, { onConflict: 'user_id, post_id' }); // Usar la restricción única para upsert

        if (error) throw error;
        console.log('Reacción enviada/actualizada con éxito');
        // Opcional: Mostrar feedback visual de éxito

      } else {
        // Es un mensaje de texto
        const messageContent = message.trim();
        if (!messageContent) return; // No enviar mensajes vacíos

        console.log(`Enviando mensaje "${messageContent}" al post ${postId} de ${senderId} para ${receiverId}`);
        const { error } = await supabase
          .from('messages')
          .insert({
            post_id: postId,
            sender_user_id: senderId,
            receiver_user_id: receiverId,
            content: messageContent,
          });
        
        if (error) throw error;
        console.log('Mensaje enviado con éxito');
        setMessage(''); // Limpiar campo de texto después de enviar
        // Opcional: Mostrar feedback visual de éxito
      }
    } catch (error: any) {
      // Mostramos el objeto de error completo para más detalles
      console.error('Error completo al enviar mensaje/reacción:', JSON.stringify(error, null, 2));
      // Mantenemos el mensaje original por si acaso
      console.error('Mensaje de error (si existe):', error?.message);
      Alert.alert('Error', 'No se pudo enviar el mensaje o la reacción. Inténtalo de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  // Renderiza un post individual
  const renderPost = ({ item, index }: { item: Post, index: number }) => (
    <View style={styles.fullScreenPostContainer}>
      {/* Header con info del usuario y botón de settings */}
      <View style={styles.photoHeader}>
        {/* Info del usuario (izquierda) */}
        <View style={styles.userInfoContainer}>
          {item.avatar_url ? (
            <Image 
              source={{ uri: item.avatar_url }} 
              style={styles.avatar} 
              defaultSource={require('../../assets/placeholder.png')}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          
          <Text style={styles.username}>{item.username}</Text>
        </View>

        {/* Botón de Configuración (derecha) - Usando getParent con Logs */}
        <TouchableOpacity 
          onPress={() => {
            console.log("--- Botón Configuración Presionado ---");
            console.log("Objeto navigation actual:", navigation);
            // Obtener el navegador padre (StackNavigator)
            const parentNav = navigation.getParent();
            console.log("Objeto parentNav (resultado de getParent()):", parentNav);
            
            if (parentNav) {
              console.log("Intentando: parentNav.navigate('Main', { screen: 'Settings' })");
              try {
                parentNav.navigate('Main', { screen: 'Settings' });
                console.log("parentNav.navigate llamado sin error inmediato.");
              } catch (e) {
                console.error("Error DENTRO de la llamada a parentNav.navigate:", e);
              }
            } else {
              console.warn('No se pudo obtener el navegador padre. Intentando navigate normal...');
              try {
                console.log("Intentando: navigation.navigate('Settings')");
                navigation.navigate('Settings'); // Fallback por si getParent falla
              } catch (e) {
                 console.error("Error DENTRO de la llamada a navigation.navigate:", e);
              }
            }
            console.log("--- Fin Handler Botón Configuración ---");
          }}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
      
      {/* Contenedor principal */}
      <View style={styles.mainContentContainer}>
        {/* Contenedor de la foto */}
        <View style={styles.photoFrame}>
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.photo}
            defaultSource={require('../../assets/placeholder.png')}
            resizeMode="cover"
          />
        </View>

        {/* Timestamp (debajo de la foto) */}
        <Text style={styles.timestamp}>{formatTime(item.created_at)}</Text>

        {/* Sección de reacciones rápidas */}
        <View style={styles.reactionsSection}>
          {/* Reacciones rápidas */}
          <View style={styles.quickReactionsContainer}>
            <TouchableOpacity 
              style={styles.reactionButton}
              onPress={() => sendMessage('❤️')}
              disabled={isSending} // Deshabilitar mientras se envía
            >
              <Text style={styles.reactionEmoji}>❤️</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reactionButton}
              onPress={() => sendMessage('😍')}
              disabled={isSending}
            >
              <Text style={styles.reactionEmoji}>😍</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reactionButton}
              onPress={() => sendMessage('😮')}
              disabled={isSending}
            >
              <Text style={styles.reactionEmoji}>😮</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reactionButton}
              onPress={() => {
                // Abrir selector de emojis
                // Por ahora, envía un emoji predeterminado o podemos implementar un selector completo más tarde
                sendMessage('🙂'); 
              }}
              disabled={isSending}
            >
              <Text style={styles.reactionEmoji}>🙂</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de mensaje */}
        <View style={styles.messageContainer}>
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Enviar mensaje..."
              placeholderTextColor="#999"
              editable={!isSending} // No permitir editar mientras se envía
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={() => sendMessage()}
              disabled={!message.trim() || isSending} // Deshabilitar si no hay mensaje o se está enviando
            >
              {isSending ? ( // Mostrar indicador si se está enviando (simplificado)
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.sendButtonText, (!message.trim() || isSending) && styles.sendButtonDisabled]}>
                  Enviar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // Función para tomar una foto con la cámara
  const takePhoto = async () => {
    setModalVisible(false);
    
    // Navegar a la pantalla de cámara
    try {
      // @ts-ignore - Ignoramos el error porque sabemos que la ruta existe
      navigation.navigate('Camera');
    } catch (error) {
      console.error('Error al navegar a la pantalla de cámara:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    }
  };

  // Función para seleccionar una imagen de la galería
  const pickImage = async () => {
    setModalVisible(false);
    
    try {
      // Solicitar permisos para acceder a la galería
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para seleccionar fotos.');
        return;
      }
      
      // Abrir selector de imágenes
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!pickerResult.canceled) {
        // Subir la imagen seleccionada
        uploadImage(pickerResult.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  // Función para subir una imagen a Supabase Storage
  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      
      // Verificar si hay un usuario autenticado
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para publicar fotos.');
        return;
      }
      
      // Generar un nombre de archivo único
      const fileExt = uri.split('.').pop();
      const fileName = `${randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Convertir la imagen a un formato que Supabase pueda manejar
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // En modo desarrollo, simulamos que la carga fue exitosa
      if (DEV_MODE) {
        console.log('Modo desarrollo: Simulando carga de imagen exitosa');
        
        // Simular un delay para hacer la experiencia más realista
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Agregar un post simulado a la lista
        const mockImageUrl = `https://picsum.photos/800/800?random=${Date.now()}`;
        const newPost: Post = {
          id: randomUUID(),
          user_id: user.id,
          image_url: mockImageUrl,
          created_at: new Date().toISOString(),
          username: user.user_metadata?.username || 'Usuario',
          avatar_url: user.user_metadata?.avatar_url
        };
        
        setPosts([newPost, ...posts]);
        Alert.alert('¡Éxito!', 'Tu foto ha sido publicada.');
        setUploading(false);
        return;
      }
      
      // Subir la imagen a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, blob);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Obtener la URL pública de la imagen
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);
      
      if (!data || !data.publicUrl) {
        throw new Error('No se pudo obtener la URL pública de la imagen');
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
      
      // Actualizar la lista de posts
      Alert.alert('¡Éxito!', 'Tu foto ha sido publicada.');
      fetchPosts();
      
    } catch (error) {
      console.error('Error al subir imagen:', error);
      Alert.alert('Error', 'No se pudo publicar la foto. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Contenido principal */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay publicaciones todavía</Text>
          <Text style={styles.emptySubtext}>
            Agrega amigos y comparte momentos para ver sus actualizaciones aquí.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={posts}
          renderItem={renderPost}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          pagingEnabled
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#FFFFFF"
              colors={["#FFFFFF"]}
            />
          }
        />
      )}
      
      {/* Modal para elegir cómo subir fotos */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Compartir foto</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
              <Text style={styles.modalButtonText}>Tomar foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Text style={styles.modalButtonText}>Elegir de la galería</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPostContainer: {
    height: height,
    padding: 20,
    justifyContent: 'space-between',
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#FFFFFF20',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#FFFFFF20',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 10, // Área de toque más grande
  },
  settingsIcon: {
    fontSize: 24, // Tamaño del ícono
    color: '#FFFFFF', 
  },
  mainContentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 75, // Espacio para la barra de navegación
  },
  photoFrame: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    // marginBottom: 20, // Eliminamos margen inferior, se maneja con el timestamp
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#FFFFFF80',
    alignSelf: 'center', // Centrar la fecha
    marginTop: 10,      // Espacio sobre la fecha
    marginBottom: 10,   // Espacio debajo de la fecha, antes de reacciones
  },
  reactionsSection: {
    marginVertical: 5, // Reducimos espacio vertical
    alignItems: 'center',
  },
  quickReactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  reactionButton: {
    padding: 10, // Añadimos padding para ampliar el área de toque
  },
  reactionEmoji: {
    fontSize: 32, // Emojis más grandes
  },
  messageContainer: {
    // marginTop: 'auto', // Eliminamos esto, ya no es necesario
    marginBottom: 10,
  },
  messageInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 5,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    justifyContent: 'center', // Centrar el ActivityIndicator
    alignItems: 'center',
    minWidth: 60, // Asegurar espacio para "Enviar" o el indicador
    height: 30, // Altura fija para el botón
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#FFFFFF80',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#5DA9E9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FeedScreen; 