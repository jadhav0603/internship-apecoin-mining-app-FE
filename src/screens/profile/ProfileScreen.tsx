import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import { useUser, getUserDisplayName } from '../../context/UserContext';
import { authService } from '../../services/authService';
import ProfileSettingsModal from '../../components/profile/ProfileSettingsModal';
import MyProfileModal from '../../components/profile/MyProfileModal';
import ConfirmModal from '../../components/ConfirmModal';

const MenuItem = ({ icon, title, onPress, isLast = false, color = COLORS.textPrimary }: any) => (
  <TouchableOpacity 
    style={[styles.menuItem, isLast && styles.lastMenuItem]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <View style={[styles.iconWrapper, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.menuItemTitle, { color }]}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useUser();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [myProfileVisible, setMyProfileVisible] = useState(false);

  const username = getUserDisplayName(user);
  const email = user?.email ?? '';
  const avatarUri = user?.photoURL ?? '';

  const handleLogout = async () => {
    setLogoutVisible(false);
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientMid, COLORS.backgroundGradientEnd]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setSettingsVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarGlow}>
            <View style={styles.avatarBorder}>
              <Image 
                source={avatarUri ? { uri: avatarUri } : require('../../assets/images/splashScreen-1.webp')} 
                style={styles.avatar}
              />
            </View>
          </View>
          <Text style={styles.userName}>{username}</Text>
          <Text style={styles.userEmail}>{email}</Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('ProfileDetails')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Main Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MAIN MENU</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="stats-chart-outline" 
              title="My Progress" 
              color="#c8ff14ff"
              onPress={() => navigation.navigate('MyProgress')}
            />
            <MenuItem 
              icon="people-outline" 
              title="Refer and Earn" 
              color="#14ffe4"
              onPress={() => navigation.navigate('ReferAndEarn')}
            />
            <MenuItem 
              icon="person-outline" 
              title="My Profile" 
              color="#299422ff"
              onPress={() => setMyProfileVisible(true)}
            />
            <MenuItem 
              icon="trophy-outline" 
              title="Leaderboard" 
              color="#FFD700"
              isLast
              onPress={() => navigation.navigate('Leaderboard')}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUPPORT</Text>
          <View style={styles.menuCard}>
            <MenuItem 
              icon="bug-outline" 
              title="Report Issue" 
              onPress={() => navigation.navigate('ReportIssue')}
            />
            <MenuItem 
              icon="information-circle-outline" 
              title="About Us" 
              onPress={() => navigation.navigate('AboutUs')}
            />
            <MenuItem 
              icon="log-out-outline" 
              title="Logout" 
              color="#FF4B4B"
              isLast
              onPress={() => setLogoutVisible(true)}
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <ProfileSettingsModal 
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onAboutUs={() => {
          setSettingsVisible(false);
          navigation.navigate('AboutUs');
        }}
        onReportIssue={() => {
          setSettingsVisible(false);
          navigation.navigate('ReportIssue');
        }}
        onLogout={() => {
          setSettingsVisible(false);
          setLogoutVisible(true);
        }}
      />

      <MyProfileModal
        visible={myProfileVisible}
        onClose={() => setMyProfileVisible(false)}
      />

      <ConfirmModal
        visible={logoutVisible}
        title="Logout"
        message="Are you sure you want to logout of your account?"
        confirmText="Logout"
        cancelText="Cancel"
        tone="danger"
        onConfirm={handleLogout}
        onCancel={() => setLogoutVisible(false)}
      />
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
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  scrollContent: { paddingTop: 20 },
  profileSection: { alignItems: 'center', marginBottom: 40 },
  avatarGlow: {
    padding: 8,
    borderRadius: 70,
    backgroundColor: 'rgba(57, 255, 20, 0.1)',
    shadowColor: '#20321dff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#39FF14',
    padding: 3,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  userName: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 20 },
  userEmail: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  editButton: {
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.4)',
    backgroundColor: 'rgba(57, 255, 20, 0.05)',
  },
  editButtonText: { color: '#0de8fcff', fontSize: 14, fontWeight: '700' },
  section: { paddingHorizontal: 20, marginBottom: 25,marginTop:-5 },
  sectionLabel: { 
    color: COLORS.textMuted, 
    fontSize: 12, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    marginLeft: 5,
    letterSpacing: 1,
  },
  menuCard: {
    backgroundColor: 'rgba(18, 26, 18, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  lastMenuItem: { borderBottomWidth: 0 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemTitle: { fontSize: 16, fontWeight: '600' },
});

export default ProfileScreen;
