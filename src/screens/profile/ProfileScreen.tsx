import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { userService } from '../../services/userService';
import ProfileSettingsModal from '../../components/profile/ProfileSettingsModal';
import MyProfileModal from '../../components/profile/MyProfileModal';
import ConfirmModal from '../../components/ConfirmModal';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import { PROFILE_THEME, resolveProfileName } from '../../components/profile/profileTheme';
import AppBackButton from '../../components/navigation/AppBackButton';


const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useUser();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [myProfileVisible, setMyProfileVisible] = useState(false);
  const [, setIsLoading] = useState(true);
  const [isLoggingOut] = useState(false);

  const [username, setUsername] = useState(getUserDisplayName(user));
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState(user?.photoURL ?? '');

  const handleLogout = async () => {
    setLogoutVisible(false);
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const confirmLogout = () => {
    if (isLoggingOut) return;
    setLogoutVisible(true);
  };

  const menuItems = useMemo(
    () => [
      { id: 'account', label: 'Edit Profile', icon: 'person-outline' as const, iconBg: '#1a3a1a', active: true },
      { id: 'progress', label: 'My Progress', icon: 'stats-chart-outline' as const, iconBg: '#1a3a1a', active: false },
      { id: 'referral', label: 'Refer and Earn', icon: 'people-outline' as const, iconBg: '#1a1a3a', active: false },
      { id: 'leaderboard', label: 'Leader Board', icon: 'trophy-outline' as const, iconBg: '#3a3114', active: false },
      { id: 'report_issue', label: 'Report & Issues', icon: 'alert-circle-outline' as const, iconBg: '#2a3517', active: false },
      { id: 'about', label: 'About Us', icon: 'information-circle-outline' as const, iconBg: '#1a3a1a', active: false },
      { id: 'logout', label: 'Log Out', icon: 'log-out-outline' as const, iconBg: PROFILE_THEME.dangerBg, active: false, tone: 'danger' as const },
    ],
    []
  );

  const menuAnimations = useRef(menuItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfileIdentity();
        if (!isMounted) return;
        const resolvedName = resolveProfileName(profile.username, profile.email);
        setUsername(resolvedName);
        setEmail(profile.email);
        setAvatarUri(profile.photoURL ?? '');
      } catch {
        if (isMounted) {
          setUsername(getUserDisplayName(user));
          setEmail(user?.email ?? '');
          setAvatarUri(user?.photoURL ?? '');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [user]);

  useEffect(() => {
    const animation = Animated.stagger(
      80,
      menuAnimations.map(anim =>
        Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true })
      )
    );
    animation.start();
    return () => animation.stop();
  }, [menuAnimations]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs', {screen: 'Home'});
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
        <AppBackButton onPress={handleBack} iconSize={24} />
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
          
          {/* <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('ProfileDetails')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity> */}
        </View>

        {/* Main Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT & ACTIVITY</Text>
          {menuItems.map((item, index) => (
            <Animated.View
              key={item.id}
              style={{
                opacity: menuAnimations[index],
                transform: [{
                  translateY: menuAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                }],
              }}
            >
              <ProfileMenuItem
                label={item.label}
                icon={item.icon}
                iconBg={item.iconBg}
                active={item.active}
                tone={item.tone as any}
                disabled={item.id === 'logout' && isLoggingOut}
                onPress={() => {
                  if (item.id === 'account') { setMyProfileVisible(true); return; }
                  if (item.id === 'logout') { confirmLogout(); return; }
                  if (item.id === 'progress') {
                    navigation.navigate('MyProgress');
                    return;
                  }
                  if (item.id === 'referral') {
                    navigation.navigate('ReferAndEarn');
                    return;
                  }
                  if (item.id === 'report_issue') {
                    navigation.navigate('ReportIssue');
                    return;
                  }
                  if (item.id === 'leaderboard') {
                    navigation.navigate('Leaderboard');
                    return;
                  }
                  if (item.id === 'about') {
                    navigation.navigate('AboutUs');
                    return;
                  }
                }}
              />
            </Animated.View>
          ))}
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
});

export default ProfileScreen;
