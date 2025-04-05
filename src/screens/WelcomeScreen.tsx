import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Image, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Línea de acento vertical */}
      <View style={styles.accentLine} />
      
      {/* Contenido principal */}
      <View style={styles.contentContainer}>
        {/* Título y subtítulo */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Locket</Text>
          <Text style={styles.subtitle}>
            Live pics from your friends, on your home screen
          </Text>
        </View>
        
        {/* Widget decorativo (simulación de un widget de fotos) */}
        <View style={styles.widgetOuterFrame}>
          <View style={styles.widgetInnerFrame}>
            {/* Aquí podría ir una imagen de muestra */}
          </View>
        </View>
        
        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginTextBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003F91', // Color azul oscuro del fondo
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 5,
    height: '100%',
    backgroundColor: '#076CD9', // Color azul brillante para la línea de acento
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: 'space-between',
    paddingBottom: 60
  },
  titleContainer: {
    marginTop: 40,
    marginLeft: 40
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC',
    maxWidth: 260,
    lineHeight: 24
  },
  widgetOuterFrame: {
    alignSelf: 'center',
    width: 165,
    height: 165,
    backgroundColor: '#E0EFD3', // Color verde claro para el marco exterior del widget
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  widgetInnerFrame: {
    width: 155,
    height: 155,
    backgroundColor: '#5DA9E9', // Color azul claro para el marco interior
    borderRadius: 6
  },
  buttonContainer: {
    paddingHorizontal: 40,
    marginBottom: 30
  },
  getStartedButton: {
    backgroundColor: '#5DA9E9', // Color azul claro para el botón
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  loginLink: {
    alignItems: 'center',
    padding: 10
  },
  loginLinkText: {
    color: '#FFFFFF',
    fontSize: 16
  },
  loginTextBold: {
    fontWeight: 'bold'
  }
});

export default WelcomeScreen; 