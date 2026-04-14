import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {authService} from '../services/authService';
import {Colors} from '../theme/colors';
import {RootStackParamList} from '../navigation/types';

const BG_IMAGE = require('../assets/images/auth_bg.png');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const Demo: React.FC<Props> = ({navigation}) => {
  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigation.replace('SignIn');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground source={BG_IMAGE} style={styles.background}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#000000']}
          style={styles.overlay}>
          
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <Text style={styles.title}>Welcome to ApeCoin</Text>
              <Text style={styles.subtitle}>You have successfully authenticated.</Text>
              
              <View style={styles.card}>
                <Text style={styles.cardText}>
                  This is the Demo screen. You are now logged in and synced with our MongoDB backend.
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.logoutBtn} 
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutTxt}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neonGreen,
    marginBottom: 40,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    marginBottom: 40,
  },
  cardText: {
    color: '#BBBBBB',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  logoutBtn: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutTxt: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Demo;
