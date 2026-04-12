import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MiningButton from '../../components/home/MiningButton';
import { COLORS } from '../../constants/COLORS';
import { RootStackParamList } from '../../navigation/types';
import styles from './login.styles';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleOpenMining = () => {
    navigation.navigate('Mining');
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientMid, COLORS.backgroundGradientEnd]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.primaryGlow} />
        <View style={styles.secondaryGlow} />

        <View style={styles.content}>
          <Text style={styles.badge}>APECOIN MINING GRID</Text>
          <Text style={styles.title}>Launch a futuristic mining core</Text>
          <Text style={styles.subtitle}>
            Open the neon dashboard and jump straight into a premium crypto-mining timer interface.
          </Text>

          <View style={styles.buttonContainer}>
            <MiningButton onPress={handleOpenMining} />
          </View>

          <Text style={styles.footerText}>TAP THE CORE TO ENTER</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;
