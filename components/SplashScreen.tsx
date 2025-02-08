import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
        <StatusBar style='auto' />
      <Image source={require('../assets/images/icon.png')} style={styles.logo} />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#500000',
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eab620',
  },
});

export default SplashScreen;