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
  RefreshControl,
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
import { useWallet } from '../../context/WalletContext';
import { useAlert } from '../../context/AlertContext';
import { authService } from '../../services/authService';
import { type BackendUser, userService } from '../../services/userService';
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
import { useAds } from '../../context/AdContext';
import styles from './ProfileScreen.style';

const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const bottomContentPadding = useBottomOverlayPadding(40);
  const { user } = useUser();
  const { breakdown, refreshBalance } = useWallet();
  const { showError } = useAlert();
  const { adUnits } = useAds();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [myProfileVisible, setMyProfileVisible] = useState(false);
  const [, setIsLoading] = useState(true);
  const [isLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [username, setUsername] = useState(getUserDisplayName(user));
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState(user?.photoURL ?? '');
  const [profileData, setProfileData] = useState<BackendUser | null>(null);
  const profileAura = useRef(new Animated.Value(0)).current;
  const hasShownInitialProfileAdRef = useRef(false);
  const isProfileFocusedRef = useRef(false);

  const { isLoaded, load, show } = useInterstitialAd(
    adUnits.INTERSTITIAL_PROFILE,
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

  const loadProfile = useCallback(async () => {
    try {
      const profile = await userService.getMe();
      const resolvedName = resolveProfileName(
        profile.name ?? profile.displayName ?? '',
        profile.email,
      );
      setProfileData(profile);
      setUsername(resolvedName);
      setEmail(profile.email);
      setAvatarUri(profile.imageUrl ?? profile.photoURL ?? '');
    } catch {
      setUsername(getUserDisplayName(user));
      setEmail(user?.email ?? '');
      setAvatarUri(user?.photoURL ?? '');
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await Promise.all([loadProfile(), refreshBalance()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadProfile, refreshBalance, refreshing]);

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

  const formatMetricValue = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
      return '0';
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }

    return value.toFixed(value >= 100 ? 0 : 1);
  };

  const buildProfileSubtitle = (profile: BackendUser | null) => {
    const plan =
      typeof profile?.plan === 'string' && profile.plan.trim()
        ? profile.plan.trim()
        : 'APE Coin';
    const status =
      typeof profile?.status === 'string' && profile.status.trim()
        ? profile.status.trim().toLowerCase()
        : 'active';

    return `${plan} member with an ${status} profile focused on steady mining and rewards.`;
  };

  const profileHandle = buildHandle(username);
  const profileInitial = getInitial(username);
  const profileSubtitle = buildProfileSubtitle(profileData);
  const totalBreakdown =
    Math.max(0, breakdown.miningAmount) +
    Math.max(0, breakdown.rewardAmount) +
    Math.max(0, breakdown.referralAmount);
  const profileStats = [
    {
      key: 'mining',
      label: 'Mining',
      value: formatMetricValue(breakdown.miningAmount),
    },
    {
      key: 'rewards',
      label: 'Rewards',
      value: formatMetricValue(breakdown.rewardAmount),
    },
    {
      key: 'referral',
      label: 'Referral',
      value:
        Number.isFinite(profileData?.referralCount) && (profileData?.referralCount ?? 0) > 0
          ? String(profileData?.referralCount ?? 0)
          : formatMetricValue(breakdown.referralAmount),
    },
  ];
  const miningRatio =
    totalBreakdown > 0 ? Math.max(0.12, breakdown.miningAmount / totalBreakdown) : 0.34;
  const rewardRatio =
    totalBreakdown > 0 ? Math.max(0.12, breakdown.rewardAmount / totalBreakdown) : 0.33;
  const referralRatio =
    totalBreakdown > 0 ? Math.max(0.12, breakdown.referralAmount / totalBreakdown) : 0.33;
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
              name="menu-outline"
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor={COLORS.primary}
            />
          }
        >
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#314514', '#1d2b0f', '#10170c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileCover}
            >
              <View style={styles.cloudOne} />
              <View style={styles.cloudTwo} />
              <View style={styles.cloudThree} />

              <Pressable
                style={({ pressed }) => [
                  styles.profileTopAction,
                  pressed && styles.profileTopActionPressed,
                ]}
                onPress={() => setMyProfileVisible(true)}
              >
                <Text style={styles.profileTopActionText}>Edit</Text>
                <Ionicons name="add" size={16} color={COLORS.primary} />
              </Pressable>
            </LinearGradient>

            <View style={styles.profileSection}>
              <View style={styles.profileIdentityRow}>
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
                          colors={['#30521d', '#16240f']}
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
                  <View style={styles.profileMiniMeta}>
                    <Text style={styles.profileMiniMetaLabel}>exp.</Text>
                    <View style={styles.profileMiniBarTrack}>
                      <View
                        style={[
                          styles.profileMiniBarSegment,
                          styles.profileMiniBarSegmentMining,
                          { flex: miningRatio },
                        ]}
                      />
                      <View
                        style={[
                          styles.profileMiniBarSegment,
                          styles.profileMiniBarSegmentReward,
                          { flex: rewardRatio },
                        ]}
                      />
                      <View
                        style={[
                          styles.profileMiniBarSegment,
                          styles.profileMiniBarSegmentReferral,
                          { flex: referralRatio },
                        ]}
                      />
                    </View>
                  </View>

                  <Text style={styles.userName}>{username}</Text>
                  <Text style={styles.profileSubtitle}>{profileSubtitle}</Text>
                  <Text style={styles.userHandle}>{profileHandle}</Text>
                  <Text style={styles.emailPlain} numberOfLines={1}>
                    {email}
                  </Text>
                </View>
              </View>

              {/* <View style={styles.profileStatsRow}>
                {profileStats.map((item, index) => (
                  <View
                    key={item.key}
                    style={[
                      styles.profileStatCard,
                      index < profileStats.length - 1 &&
                        styles.profileStatCardSpacing,
                    ]}
                  >
                    <Text style={styles.profileStatValue}>{item.value}</Text>
                    <Text style={styles.profileStatLabel}>{item.label}</Text>
                  </View>
                ))}
              </View> */}

              <View style={[styles.profileQuickRow , styles.profileStatsRow]}>
                <Pressable
                  style={styles.profileQuickIcon}
                  onPress={() => navigation.navigate('TransactionHistory')}
                >
                  <Ionicons
                    name="wallet-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </Pressable>
                <Pressable
                  style={styles.profileQuickIcon}
                  onPress={() => navigation.navigate('MyProgress')}
                >
                  <Ionicons
                    name="stats-chart-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </Pressable>
                <Pressable
                  style={styles.profileQuickIcon}
                  onPress={() => setSettingsVisible(true)}
                >
                  <Ionicons
                    name="settings-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.adContainer}>
            <BannerAd
              unitId={adUnits.BANNER_PROFILE}
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
