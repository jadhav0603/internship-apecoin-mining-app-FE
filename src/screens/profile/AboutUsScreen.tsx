import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/COLORS';

const AboutUsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientMid, COLORS.backgroundGradientEnd]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <Image 
              source={require('../../assets/images/splashScreen-1.webp')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>ApeCoin Mining</Text>
          <Text style={styles.appVersion}>Version 1.0.4</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.sectionTitle}>What is ApeCoin?</Text>
          <Text style={styles.description}>
            ApeCoin is a decentralized ecosystem token designed to empower the community of explorers in the digital age. 
            Our platform allows users to mine APC coins through a cloud-based simulation, participate in daily rewards, 
            and earn through a robust referral system.
          </Text>
        </View>

        <View style={styles.featureList}>
          <Text style={styles.sectionTitle}>Core Features</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="hammer-outline" size={24} color={COLORS.primary} />
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Cloud Mining</Text>
              <Text style={styles.featureSubtitle}>Efficient APC mining with minimal battery drain.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="gift-outline" size={24} color={COLORS.primary} />
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Daily Rewards</Text>
              <Text style={styles.featureSubtitle}>Claim bonus APC every 24 hours.</Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="people-outline" size={24} color={COLORS.primary} />
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Referral System</Text>
              <Text style={styles.featureSubtitle}>Invite friends and earn a percentage of their mining.</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Follow us on social media for updates</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-twitter" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-discord" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="globe-outline" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.copyright}>© 2026 ApeCoin Ecosystem. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoWrapper: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.card,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  logo: { width: 70, height: 70 },
  appName: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
  appVersion: { color: COLORS.textMuted, fontSize: 14, marginTop: 5 },
  infoBox: {
    backgroundColor: 'rgba(166, 255, 0, 0.05)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.1)',
    marginBottom: 30,
  },
  sectionTitle: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  description: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 24 },
  featureList: { marginBottom: 40 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  featureTextWrapper: { marginLeft: 15, flex: 1 },
  featureTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  featureSubtitle: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { color: COLORS.textMuted, fontSize: 14, marginBottom: 15 },
  socialIcons: { flexDirection: 'row', marginBottom: 25 },
  socialButton: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.card,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  copyright: { color: COLORS.textMuted, fontSize: 12, marginTop: 10 },
});

export default AboutUsScreen;
