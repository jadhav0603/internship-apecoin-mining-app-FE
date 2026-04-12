import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/COLORS';
import MiningButton from '../components/home/MiningButton';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Login Page</Text>
      <MiningButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
