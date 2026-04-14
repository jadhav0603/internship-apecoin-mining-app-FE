import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MiningButton from '../../components/home/MiningButton';
import { COLORS } from '../../constants/COLORS';
import { RootStackParamList } from '../../navigation/types';
import styles from './login.styles';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleOpenApp = () => {
    navigation.replace('MainTabs', { screen: 'Home' });
  };

  return (
    <LinearGradient
      colors={[
        COLORS.backgroundGradientStart,
        COLORS.backgroundGradientMid,
        COLORS.backgroundGradientEnd,
      ]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.primaryGlow} />
        <View style={styles.secondaryGlow} />

        <View style={styles.content}>
          <Text style={styles.badge}>APECOIN ACCESS</Text>
          <Text style={styles.title}>Enter your wallet dashboard</Text>
          <Text style={styles.subtitle}>
            Continue into the home, wallet, rewards, and profile flow, then
            launch mining from the main app.
          </Text>

          <View style={styles.buttonContainer}>
            <MiningButton onPress={handleOpenApp} />
          </View>

          <Text style={styles.footerText}>TAP TO CONTINUE</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;
