import React from 'react';
import {
  View, 
  Text, 
  StyleSheet 
} from 'react-native';

const SimpleFriendsScreen = () => {
  console.log("INTENTANDO RENDERIZAR SimpleFriendsScreen - VERSIÓN MÍNIMA");
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Friends (Mínimo)</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.contentText}>Si ves esto, el componente se renderizó.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003F91',
  },
  header: {
    height: 90,
    backgroundColor: '#5DA9E9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentText: {
    color: 'white',
    fontSize: 18,
  },
});

export default SimpleFriendsScreen; 