import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { useUser, getUserDisplayName } from '../../context/UserContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import ProfileSettingsModal from '../../components/profile/ProfileSettingsModal';
import MyProfileModal from '../../components/profile/MyProfileModal';
import ConfirmModal from '../../components/ConfirmModal';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import {
  PROFILE_THEME,
  buildHandle,
  getInitial,
  resolveProfileName,
} from '../../components/profile/profileTheme';
import AppBackButton from '../../components/navigation/AppBackButton';
import useBottomOverlayPadding from '../../hooks/useBottomOverlayPadding';
import {
  BannerAd,
  BannerAdSize,
  useInterstitialAd,
} from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';
import { useAdLoadingGate } from '../../hooks/useAdLoadingGate';

const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const bottomContentPadding = useBottomOverlayPadding(40);
  const { user } = useUser();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [myProfileVisible, setMyProfileVisible] = useState(false);
  const [, setIsLoading] = useState(true);
  const [isLoggingOut] = useState(false);

  const [username, setUsername] = useState(getUserDisplayName(user));
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState(user?.photoURL ?? '');
  const profileAura = useRef(new Animated.Value(0)).current;
  const skipNextFocusAdRef = useRef(false);

  const { isLoaded, isClosed, load, show } = useInterstitialAd(
    AD_UNITS.INTERSTITIAL_PROFILE,
    {
      requestNonPersonalizedAdsOnly: true,
    },
  );
  const { startAd, adLoadingModal } = useAdLoadingGate({
    isLoaded,
    load,
    show,
  });

  useEffect(() => {
    if (!isClosed) {
      return;
    }

    skipNextFocusAdRef.current = true;
  }, [isClosed]);

  useFocusEffect(
    useCallback(() => {
      if (skipNextFocusAdRef.current) {
        skipNextFocusAdRef.current = false;
        return;
      }

      startAd();
    }, [startAd]),
  );

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
      // {
      //   id: 'account',
      //   label: 'Edit Profile',
      //   icon: 'person-outline' as const,
      //   iconBg: '#1a3a1a',
      //   active: true,
      // },
      {
        id: 'progress',
        label: 'My Progress',
        icon: 'stats-chart-outline' as const,
        iconBg: '#1a3a1a',
        active: false,
      },
      {
        id: 'referral',
        label: 'Refer and Earn',
        icon: 'people-outline' as const,
        iconBg: '#1a1a3a',
        active: false,
      },
      {
        id: 'leaderboard',
        label: 'Leader Board',
        icon: 'trophy-outline' as const,
        iconBg: '#3a3114',
        active: false,
      },
      {
        id: 'report_issue',
        label: 'Report & Issues',
        icon: 'alert-circle-outline' as const,
        iconBg: '#2a3517',
        active: false,
      },
      {
        id: 'about',
        label: 'About Us',
        icon: 'information-circle-outline' as const,
        iconBg: '#1a3a1a',
        active: false,
      },
      {
        id: 'logout',
        label: 'Log Out',
        icon: 'log-out-outline' as const,
        iconBg: PROFILE_THEME.dangerBg,
        active: false,
        tone: 'danger' as const,
      },
    ],
    [],
  );

  const menuAnimations = useRef(
    menuItems.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const profile = await userService.getProfileIdentity();
        if (!isMounted) return;
        const resolvedName = resolveProfileName(
          profile.username,
          profile.email,
        );
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
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    const animation = Animated.stagger(
      80,
      menuAnimations.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ),
    );
    animation.start();
    return () => animation.stop();
  }, [menuAnimations]);

  useEffect(() => {
    const auraLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(profileAura, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(profileAura, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    );

    auraLoop.start();

    return () => auraLoop.stop();
  }, [profileAura]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const profileHandle = buildHandle(username);
  const profileInitial = getInitial(username);
  const avatarPulseStyle = {
    transform: [
      {
        scale: profileAura.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.04],
        }),
      },
    ],
    opacity: profileAura.interpolate({
      inputRange: [0, 1],
      outputRange: [0.35, 0.75],
    }),
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
      style={styles.background}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor="transparent"
        />
        <View style={styles.primaryGlow} />
        <View style={styles.secondaryGlow} />

        {/* Header */}
        <View style={styles.header}>
          <AppBackButton onPress={handleBack} iconSize={24} />
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomContentPadding },
          ]}
        >
          <LinearGradient
            colors={['rgba(23, 31, 21, 0.96)', 'rgba(10, 15, 10, 0.94)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileCard}
          >
            <View style={styles.profileCardGlow} />

            <View style={styles.profileSection}>
              <View style={styles.profileTopRow}>
                <View style={styles.avatarShell}>
                  <Animated.View
                    style={[styles.avatarPulseRing, avatarPulseStyle]}
                  />
                  <View style={styles.avatarGlow}>
                    <View style={styles.avatarBorder}>
                      {avatarUri ? (
                        <Image
                          source={{ uri: avatarUri }}
                          style={styles.avatar}
                        />
                      ) : (
                        <LinearGradient
                          colors={['#2E420F', '#131D0C']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.avatarFallback}
                        >
                          <Text style={styles.avatarFallbackText}>
                            {profileInitial}
                          </Text>
                        </LinearGradient>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.identityContent}>
                  <View style={styles.identityPill}>
                    <Text style={styles.identityPillText}>Premium profile</Text>
                  </View>

                  <Text style={styles.userName}>{username}</Text>
                  <Text style={styles.userHandle}>{profileHandle}</Text>

                  <View style={styles.userMetaRow}>
                    <View style={styles.userMetaChip}>
                      <Ionicons
                        name="mail-outline"
                        size={13}
                        color={COLORS.textMuted}
                      />
                      <Text style={styles.userMetaText} numberOfLines={1}>
                        {email}
                      </Text>
                    </View>
                    <View style={styles.userMetaChip}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={13}
                        color={COLORS.primary}
                      />
                      <Text style={styles.userMetaText}>Verified</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.profileStatsRow}>
                <View
                  style={[
                    styles.profileStatCard,
                    styles.profileStatCardSpacing,
                  ]}
                >
                  <Text style={styles.profileStatLabel}>Account</Text>
                  <Text style={styles.profileStatValue}>Active</Text>
                </View>
                <View style={styles.profileStatCard}>
                  <Text style={styles.profileStatLabel}>Support</Text>
                  <Text style={styles.profileStatValue}>Priority</Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.profilePrimaryAction,
                  pressed && styles.profilePrimaryActionPressed,
                ]}
                onPress={() => setMyProfileVisible(true)}
              >
                <LinearGradient
                  colors={['rgba(200,255,114,0.22)', 'rgba(170,255,0,0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.profilePrimaryActionInner}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                  <Text style={styles.profilePrimaryActionText}>
                    Edit profile details
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </LinearGradient>

          <View style={styles.adContainer}>
            <BannerAd
              unitId={AD_UNITS.BANNER_PROFILE}
              size={BannerAdSize.BANNER}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionLabel}>ACCOUNT & ACTIVITY</Text>
                <Text style={styles.sectionTitle}>Manage your profile</Text>
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {menuItems.length} actions
                </Text>
              </View>
            </View>
            {menuItems.map((item, index) => (
              <Animated.View
                key={item.id}
                style={{
                  opacity: menuAnimations[index],
                  transform: [
                    {
                      translateY: menuAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [18, 0],
                      }),
                    },
                  ],
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
                    if (item.id === 'account') {
                      setMyProfileVisible(true);
                      return;
                    }
                    if (item.id === 'logout') {
                      confirmLogout();
                      return;
                    }
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
        {adLoadingModal}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    marginTop: -10,
  },
  container: { flex: 1 },
  primaryGlow: {
    position: 'absolute',
    top: -60,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.surfaceGlow,
    opacity: 0.34,
  },
  secondaryGlow: {
    position: 'absolute',
    right: -50,
    bottom: 80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.ringGlowSoft,
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  settingsButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 18,
  },
  profileCard: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(198,255,112,0.14)',
    marginBottom: 26,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  profileCardGlow: {
    position: 'absolute',
    top: -30,
    right: -10,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(170,255,0,0.08)',
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarShell: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarPulseRing: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: 'rgba(170,255,0,0.08)',
  },
  avatarGlow: {
    padding: 10,
    borderRadius: 72,
    backgroundColor: 'rgba(57, 255, 20, 0.12)',
    shadowColor: '#20321dff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  avatarBorder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: '#39FF14',
    padding: 4,
    backgroundColor: 'rgba(10,15,10,0.72)',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 52 },
  avatarFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  identityPill: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  identityPillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  identityContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 27,
    fontWeight: '800',
    marginTop: 12,
  },
  userHandle: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginTop: 4,
  },
  userMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  userMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 8,
    marginBottom: 8,
  },
  userMetaText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginLeft: 6,
  },
  profileStatsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 18,
  },
  profileStatCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  profileStatCardSpacing: {
    marginRight: 12,
  },
  profileStatLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  profileStatValue: {
    marginTop: 6,
    color: COLORS.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  profilePrimaryAction: {
    width: '100%',
    marginTop: 14,
    borderRadius: 18,
    overflow: 'hidden',
  },
  profilePrimaryActionPressed: {
    opacity: 0.92,
  },
  profilePrimaryActionInner: {
    minHeight: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(170,255,0,0.14)',
  },
  profilePrimaryActionText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    marginTop: 4,
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  sectionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionBadgeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
});

export default ProfileScreen;
