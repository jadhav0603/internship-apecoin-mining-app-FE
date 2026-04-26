import React, { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

import styles from './Menu.styles';
import { COLORS } from '../../constants/COLORS';
import { authService } from '../../services/authService';
import ConfirmModal from '../ConfirmModal';
import UserHeader from './UserHeader';
import type { RootStackParamList } from '../../navigation/types';

type MenuNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MENU_ANIMATION_MS = 300;

const Menu = () => {
  const navigation = useNavigation<MenuNavigationProp>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  const closeMenu = () => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: MENU_ANIMATION_MS,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  };

  const openMenu = () => {
    setMenuOpen(true);
    Animated.timing(menuAnim, {
      toValue: 1,
      duration: MENU_ANIMATION_MS,
      useNativeDriver: true,
    }).start();
  };

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu();
      return;
    }

    openMenu();
  };

  const handleLogout = async () => {
    setLogoutVisible(false);

    try {
      await authService.signOut();
    } catch (err) {
      console.log('Logout error', err);
    }
  };

  const handleLogoutPress = () => {
    if (menuOpen) {
      closeMenu();
    }

    setLogoutVisible(true);
  };

  const handleTransactionHistory = () => {
    closeMenu();
    navigation.navigate('TransactionHistory');
  };

  const menuItems: Array<{
    label: string;
    icon: string;
    onPress?: () => void;
    tone?: 'default' | 'danger';
  }> = [
    {
      label: 'Transaction History',
      icon: 'time-outline',
      onPress: handleTransactionHistory,
    },
    { label: 'Other App', icon: 'apps-outline' },
    { label: 'Report', icon: 'flag-outline' },
    { label: 'FAQ', icon: 'help-circle-outline' },
    { label: 'Terms & Conditions', icon: 'document-text-outline' },
    { label: 'Connect Us', icon: 'chatbubbles-outline' },
    { label: 'Delete Account', icon: 'trash-outline', tone: 'danger' },
  ];

  const menuAnimatedStyle = {
    opacity: menuAnim,
    transform: [
      {
        translateY: menuAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
      {
        scale: menuAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  };

  return (
    <>
      <View style={styles.topRow}>
        <UserHeader />

        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Ionicons name="menu" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {menuOpen ? (
        <Pressable style={styles.overlay} onPress={closeMenu} />
      ) : null}

      <Animated.View
        pointerEvents={menuOpen ? 'auto' : 'none'}
        style={[styles.menuContainer, menuAnimatedStyle]}
      >
        <LinearGradient
          colors={['#04110A', '#0A1610', '#06110C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        >
          <LinearGradient
            colors={[
              'rgba(132,255,93,0.12)',
              'rgba(25,74,44,0.05)',
              'rgba(0,0,0,0)',
            ]}
            start={{ x: 0, y: 0.1 }}
            end={{ x: 1, y: 0.9 }}
            style={styles.greenGlow}
          />

          <View style={styles.monkeyArtWrap} pointerEvents="none">
            <Image
              source={require('../../assets/images/drawer-bg2.webp')}
              style={styles.monkeyArt}
              resizeMode="contain"
            />
            <LinearGradient
              colors={[
                'rgba(4, 9, 7, 0.12)',
                'rgba(4, 9, 7, 0.45)',
                'rgba(4, 9, 7, 0.75)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.9 }}
              style={styles.monkeyOverlay}
            />
          </View>

          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <View
              style={[
                styles.centerWrap,
                {
                  paddingTop: Math.max(insets.top, 10),
                  paddingBottom: Math.max(
                    tabBarHeight + 18,
                    insets.bottom + 24,
                  ),
                },
              ]}
            >
              <View style={styles.menuCard}>
                <View style={styles.menuHeader}>
                  <View style={styles.headerCopy}>
                    <Text style={styles.menuTitle}>Menu</Text>
                    <Text style={styles.menuSubtitle}>
                      Manage your ApeCoin account
                    </Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.closeButton,
                      pressed && styles.closeButtonPressed,
                    ]}
                    onPress={closeMenu}
                  >
                    <AntDesign name="close" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.menuList}
                >
                  {menuItems.map(item => {
                    const isDanger = item.tone === 'danger';

                    return (
                      <Pressable
                        key={item.label}
                        style={({ pressed }) => [
                          styles.menuItemCard,
                          isDanger && styles.menuItemCardDanger,
                          pressed && item.onPress && styles.menuItemCardPressed,
                          !item.onPress && styles.menuItemCardDisabled,
                        ]}
                        onPress={item.onPress}
                        disabled={!item.onPress}
                      >
                        <View
                          style={[
                            styles.menuItemIconCircle,
                            isDanger && styles.menuItemIconCircleDanger,
                          ]}
                        >
                          <Ionicons
                            name={item.icon}
                            size={20}
                            color={isDanger ? '#FF8D97' : '#A4FF58'}
                          />
                        </View>

                        <Text
                          style={[
                            styles.menuItemText,
                            isDanger && styles.menuItemTextDanger,
                          ]}
                        >
                          {item.label}
                        </Text>

                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color={
                            isDanger
                              ? 'rgba(255,141,151,0.72)'
                              : 'rgba(255,255,255,0.56)'
                          }
                        />
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Pressable
                  style={({ pressed }) => [
                    styles.logoutCard,
                    pressed && styles.logoutCardPressed,
                  ]}
                  onPress={handleLogoutPress}
                >
                  <View style={styles.logoutIconCircle}>
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#FF6677"
                    />
                  </View>

                  <Text style={styles.logoutText}>Logout</Text>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="rgba(255,102,119,0.76)"
                  />
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

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
    </>
  );
};

export default Menu;
