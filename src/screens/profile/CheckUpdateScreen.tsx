import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import AppBackButton from '../../components/navigation/AppBackButton';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './CheckUpdateScreen.style';

const CheckUpdateScreen = () => {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={[
        COLORS.backgroundGradientStart,
        COLORS.backgroundGradientMid,
        COLORS.backgroundGradientEnd,
      ]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <AppBackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Check Update</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.content}>
          <Text style={styles.placeholderText}>You are currently using the latest version.</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CheckUpdateScreen;
