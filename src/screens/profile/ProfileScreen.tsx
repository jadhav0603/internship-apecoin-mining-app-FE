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
  Alert,
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
import { useAlert } from '../../context/AlertContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { isBlockedAccountError } from '../../session/blockedAccountState';
import ProfileSettingsModal from '../../components/profile/ProfileSettingsModal';
import MyProfileModal from '../../components/profile/MyProfileModal';
import ConfirmModal from '../../components/reward/ConfirmModal';
import DeleteAccountConfirmModal from '../../components/profile/DeleteAccountConfirmModal';
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
import styles from './ProfileScreen.style';

const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const bottomContentPadding = useBottomOverlayPadding(40);
  const { user } = useUser();
  const { showError } = useAlert();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [myProfileVisible, setMyProfileVisible] = useState(false);
  const [, setIsLoading] = useState(true);
  const [isLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [username, setUsername] = useState(getUserDisplayName(user));
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState(user?.photoURL ?? '');
  const profileAura = useRef(new Animated.Value(0)).current;
  const hasShownInitialProfileAdRef = useRef(false);
  const isProfileFocusedRef = useRef(false);

  const { isLoaded, load, show } = useInterstitialAd(
    AD_UNITS.INTERSTITIAL_PROFILE,
    {
      requestNonPersonalizedAdsOnly: true,
    },
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isProfileFocusedRef.current || hasShownInitialProfileAdRef.current) {
      return;
    }

    hasShownInitialProfileAdRef.current = true;

    try {
      requestAnimationFrame(() => {
        show();
      });
    } catch (error) {
      hasShownInitialProfileAdRef.current = false;
      console.warn('[profile] failed to show interstitial ad:', error);
    }
  }, [isLoaded, show]);

  useFocusEffect(
    useCallback(() => {
      isProfileFocusedRef.current = true;

      if (isLoaded && !hasShownInitialProfileAdRef.current) {
        hasShownInitialProfileAdRef.current = true;

        try {
          requestAnimationFrame(() => {
            show();
          });
        } catch (error) {
          hasShownInitialProfileAdRef.current = false;
          console.warn('[profile] failed to show interstitial ad:', error);
        }
      }

      return () => {
        isProfileFocusedRef.current = false;
      };
    }, [isLoaded, show]),
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

  const openDeleteAccountModal = () => {
    setSettingsVisible(false);
    setDeleteAccountVisible(true);
  };

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) {
      return;
    }

    try {
      setIsDeletingAccount(true);
      await authService.deleteAccount();
      setDeleteAccountVisible(false);
    } catch (error: any) {
      if (isBlockedAccountError(error)) {
        setDeleteAccountVisible(false);
        return;
      }

      console.error('[deleteAccount] profile error.response?.data:', error?.response?.data);

      showError(
        error?.response?.data?.message ??
          error?.message ??
          'Delete account request failed.',
        'Delete Account',
        {
          blurBackground: true,
          blurAmount: 18,
          theme: 'dark',
        },
      );
    } finally {
      setIsDeletingAccount(false);
    }
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
                  {/* <View style={styles.identityPill}>
                    <Text style={styles.identityPillText}>Premium profile</Text>
                  </View> */}

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
                    if (item.id === 'leaderboard') {
                      navigation.navigate('Leaderboard');
                      return;
                    }
                    if (item.id === 'report_issue') {
                      navigation.navigate('ReportIssue');
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
          onTransactionHistory={() => {
            setSettingsVisible(false);
            navigation.navigate('TransactionHistory');
          }}
          onLeaderboard={() => {
            setSettingsVisible(false);
            navigation.navigate('Leaderboard');
          }}
          onOtherApps={() => {
            setSettingsVisible(false);
            navigation.navigate('OtherApps');
          }}
          onCheckUpdate={() => {
            setSettingsVisible(false);
            navigation.navigate('CheckUpdate');
          }}
          onFAQ={() => {
            setSettingsVisible(false);
            navigation.navigate('FAQ');
          }}
          onTermsAndConditions={() => {
            setSettingsVisible(false);
            navigation.navigate('TermsAndConditions');
          }}
          onConnectUs={() => {
            setSettingsVisible(false);
            navigation.navigate('ConnectUs');
          }}
          onDeleteAccount={() => {
            setSettingsVisible(false);
            setDeleteAccountVisible(true);
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

        <DeleteAccountConfirmModal
          visible={deleteAccountVisible}
          isSubmitting={isDeletingAccount}
          onClose={() => setDeleteAccountVisible(false)}
          onConfirm={handleDeleteAccount}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default ProfileScreen;
