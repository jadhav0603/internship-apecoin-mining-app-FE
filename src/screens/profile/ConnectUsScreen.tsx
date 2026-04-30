import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import AppBackButton from '../../components/navigation/AppBackButton';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './ConnectUsScreen.style';

const ConnectUsScreen = () => {
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
          <Text style={styles.headerTitle}>Connect Us</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.content}>
          <Text style={styles.subTitle}>Follow us on social media</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-twitter" size={32} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="logo-discord" size={32} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Ionicons name="mail-outline" size={32} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.placeholderText}>Contact us at support@apecoin.com</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ConnectUsScreen;
