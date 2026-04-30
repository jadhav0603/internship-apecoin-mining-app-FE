import React, { useRef, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

import styles from './Menu.style';
import { COLORS } from '../../constants/COLORS';
import { useAlert } from '../../context/AlertContext';
import { authService } from '../../services/authService';
import { isBlockedAccountError } from '../../session/blockedAccountState';
import ConfirmModal from '../reward/ConfirmModal';
import DeleteAccountConfirmModal from '../profile/DeleteAccountConfirmModal';
import UserHeader from './UserHeader';
import type { RootStackParamList } from '../../navigation/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

type MenuNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Menu = () => {
  const navigation = useNavigation<MenuNavigationProp>();
  const { showError } = useAlert();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLogout = async () => {
    setLogoutVisible(false);

    try {
      await authService.signOut();
    } catch (err) {
      console.log("Logout error", err);
    }
  };

  const handleLogoutPress = () => {
    if (menuOpen) {
      toggleMenu();
    }

    setLogoutVisible(true);
  };

  const handleTransactionHistory = () => {
    toggleMenu();
    navigation.navigate('TransactionHistory');
  };

  const handleDeleteAccountPress = () => {
    if (menuOpen) {
      toggleMenu();
    }

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

      console.error('[deleteAccount] menu error.response?.data:', error?.response?.data);

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

  const menuItems: Array<{
    label: string;
    onPress?: () => void;
  }> = [
    {
      label: 'Transaction History',
      onPress: handleTransactionHistory,
    },
    { label: 'Other App' },
    { label: 'Report' },
    { label: 'FAQ' },
    { label: 'Terms & Conditions' },
    { label: 'Connect Us' },
    { label: 'Delete Account', onPress: handleDeleteAccountPress },
  ];

  return (
    <>
      {/* HEADER */}
      <View style={styles.topRow}>
        <UserHeader />

        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleMenu}
        >
          <Ionicons name="menu" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* OVERLAY */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* FULL SCREEN MENU */}
      <Animated.View
        pointerEvents={menuOpen ? "auto" : "none"}
        style={[
          styles.menuContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={styles.drawer}>
          <ImageBackground
            source={require('../../assets/images/drawer-bg2.webp')}
            style={styles.menuBg}
            imageStyle={styles.menuBgImage}
          >
            <View style={styles.menuOverlay}>

              {/* Header */}
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>

                <TouchableOpacity onPress={toggleMenu}>
                  <AntDesign name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItemBox}
                    onPress={item.onPress}
                    disabled={!item.onPress}
                  >
                    <Text style={styles.menuItem}>{item.label}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.menuItemBox} onPress={handleLogoutPress}>
                  <Text style={[styles.menuItem, styles.logoutText]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </ScrollView>

            </View>
          </ImageBackground>
        </View>
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

      <DeleteAccountConfirmModal
        visible={deleteAccountVisible}
        isSubmitting={isDeletingAccount}
        onClose={() => setDeleteAccountVisible(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
};

export default Menu;
