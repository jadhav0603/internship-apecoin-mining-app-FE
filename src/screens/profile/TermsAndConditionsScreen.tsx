import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import AppBackButton from '../../components/navigation/AppBackButton';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const TermsAndConditionsScreen = () => {
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
          <Text style={styles.headerTitle}>Terms & Conditions</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.text}>
            Welcome to ApeCoin. By using our application, you agree to comply with and be bound by the following terms and conditions of use...
          </Text>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing or using the service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
          </Text>
          <Text style={styles.sectionTitle}>2. Use of Service</Text>
          <Text style={styles.text}>
            You agree not to use the service for any purpose that is illegal or prohibited by these Terms.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.medium,
    lineHeight: 22,
    marginBottom: 12,
  },
});

export default TermsAndConditionsScreen;
