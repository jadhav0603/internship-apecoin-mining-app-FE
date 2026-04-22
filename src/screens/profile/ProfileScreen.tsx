import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import { BannerAd, BannerAdSize, useInterstitialAd } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';

import AvatarWithGlow from '../../components/profile/AvatarWithGlow';
import CoinsSummaryCard from '../../components/profile/CoinsSummaryCard';
import ConfirmModal from '../../components/ConfirmModal';
import MyAccountModal from '../../components/profile/MyAccountModal';
import ProfileMenuItem from '../../components/profile/ProfileMenuItem';
import ProfileSkeleton from '../../components/profile/ProfileSkeleton';
import {
  PROFILE_THEME,
  buildHandle,
  resolveProfileName,
} from '../../components/profile/profileTheme';
import { getUserDisplayName, useUser } from '../../context/UserContext';
import { RootStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState(user?.photoURL ?? '');
  const [username, setUsername] = useState(getUserDisplayName(user));

  const handleUpdateUsername = async (newName: string) => {
    if (!newName.trim() || newName === username) return;

    setIsUpdatingUsername(true);
    try {
      await userService.updateProfile(newName.trim());
      setUsername(newName.trim());
      Alert.alert('✓ Success', 'Username updated!');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to update username.';
      Alert.alert('Update Failed', message);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const { isLoaded: isInterstitialLoaded, load: loadInterstitial, show: showInterstitial } = useInterstitialAd(
    AD_UNITS.INTERSTITIAL_PROFILE,
    { requestNonPersonalizedAdsOnly: true }
  );

  useEffect(() => {
    loadInterstitial();
  }, [loadInterstitial]);

  useEffect(() => {
    if (isInterstitialLoaded) {
      showInterstitial();
    }
  }, [isInterstitialLoaded, showInterstitial]);

  useEffect(() => {
    setEmail(currentEmail => currentEmail || user?.email || '');
    setAvatarUri(currentAvatar => currentAvatar || user?.photoURL || '');
    setUsername(currentName => {
      const nextName = getUserDisplayName(user);
      return currentName === 'User' || !currentName ? nextName : currentName;
    });
  }, [user]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const handleComingSoon = (label: string) => {
    Alert.alert(label, 'This feature is coming soon!');
  };

  const openAccountModal = () => setIsAccountModalVisible(true);
  const closeAccountModal = () => setIsAccountModalVisible(false);

  // ─── Gallery picker + upload ────────────────────────────────────────────────
  const handleChangePhoto = useCallback(async () => {
    try {
      const result: ImagePickerResponse = await new Promise(resolve => {
        launchImageLibrary(
          {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1024,
            maxHeight: 1024,
            includeBase64: false,
          },
          resolve
        );
      });

      if (result.didCancel || result.errorCode) {
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        return;
      }

      setIsUploadingPhoto(true);

      const response = await userService.uploadProfileImage(
        asset.uri,
        asset.type ?? 'image/jpeg',
        asset.fileName ?? 'avatar.jpg'
      );

      setAvatarUri(response.imageUrl);
      Alert.alert('✓ Success', 'Profile photo updated!');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? 'Failed to upload photo. Please try again.';
      Alert.alert('Upload Failed', message);
    } finally {
      setIsUploadingPhoto(false);
    }
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsLogoutModalVisible(false);
    try {
      await authService.signOut();
    } catch {
      Alert.alert('Log Out', 'Unable to log out right now. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    if (isLoggingOut) return;
    setIsLogoutModalVisible(true);
  };

  const menuItems = useMemo(
    () => [
      { id: 'account', label: 'My Account', icon: 'person-outline' as const, iconBg: '#1a3a1a', active: true },
      { id: 'referral', label: 'Refer and Earn', icon: 'people-outline' as const, iconBg: '#1a1a3a', active: false },
      { id: 'leaderboard', label: 'Leader Board', icon: 'trophy-outline' as const, iconBg: '#3a3114', active: false },
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

  const userHandle = useMemo(() => buildHandle(username), [username]);
  const avatarSource = useMemo<ImageSourcePropType | undefined>(
    () => (avatarUri ? { uri: avatarUri } : undefined),
    [avatarUri]
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PROFILE_THEME.bg} barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top + 10, 54), paddingBottom: Math.max(100, tabBarHeight + 28) },
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.navSide}>
            <Pressable style={styles.navCircle} onPress={handleBack}>
              <Ionicons name="chevron-back" size={22} color={PROFILE_THEME.backIcon} />
            </Pressable>
          </View>
          <View style={styles.navSideRight} />
        </View>

        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Avatar with upload spinner overlay */}
            <View style={styles.avatarWrapper}>
              <AvatarWithGlow username={username} source={avatarSource} onPress={openAccountModal} />
              {isUploadingPhoto && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color="#B6FF3B" size="large" />
                </View>
              )}
            </View>
            <Text style={styles.userName}>{username}</Text>
            <Text style={styles.userHandle}>{userHandle}</Text>
          </>
        )}

        <CoinsSummaryCard />

        <View style={styles.menuContainer}>
          <View style={styles.adWrapper}>
            <BannerAd
              unitId={AD_UNITS.BANNER_PROFILE}
              size={BannerAdSize.BANNER}
            />
          </View>
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
                tone={item.tone}
                disabled={item.id === 'logout' && isLoggingOut}
                onPress={() => {
                  if (item.id === 'account') { openAccountModal(); return; }
                  if (item.id === 'logout') { confirmLogout(); return; }
                  if (item.id === 'referral') {
                    navigation.navigate('ReferAndEarn', { email, username });
                    return;
                  }
                  if (item.id === 'leaderboard') {
                    navigation.navigate('Leaderboard', { email, username, avatarUri });
                    return;
                  }
                  handleComingSoon(item.label);
                }}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <MyAccountModal
        visible={isAccountModalVisible}
        username={username}
        email={email}
        avatarSource={avatarSource}
        isLoggingOut={isLoggingOut}
        onClose={closeAccountModal}
        onLogout={() => {
          closeAccountModal();
          confirmLogout();
        }}
        onSaveUsername={handleUpdateUsername}
        isUpdatingUsername={isUpdatingUsername}
        onChangePhoto={handleChangePhoto}
      />

      <ConfirmModal
        visible={isLogoutModalVisible}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        tone="danger"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PROFILE_THEME.bg },
  scrollContent: { paddingHorizontal: 0 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  navSide: { alignItems: 'flex-start' },
  navSideRight: { alignItems: 'flex-end' },
  navCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: PROFILE_THEME.buttonBg,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarWrapper: {
    alignSelf: 'center',
    position: 'relative',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    color: PROFILE_THEME.white, fontSize: 22, fontWeight: '800',
    textAlign: 'center', marginTop: 14,
  },
  userHandle: {
    color: PROFILE_THEME.neonGreen, fontSize: 14, fontWeight: '500',
    textAlign: 'center', marginTop: 4,
  },
  menuContainer: { marginHorizontal: 16, marginTop: 16 },
  adWrapper: {
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
});

export default ProfileScreen;
