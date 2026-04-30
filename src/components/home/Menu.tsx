import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Ionicons from 'react-native-vector-icons/Ionicons';

import styles from './Menu.style';
import { COLORS } from '../../constants/COLORS';
import { useAlert } from '../../context/AlertContext';
import { authService } from '../../services/authService';
import { isBlockedAccountError } from '../../session/blockedAccountState';
import ConfirmModal from '../reward/ConfirmModal';
import DeleteAccountConfirmModal from '../profile/DeleteAccountConfirmModal';
import UserHeader from './UserHeader';
import type { RootStackParamList } from '../../navigation/types';
import ProfileSettingsModal from '../profile/ProfileSettingsModal';

type MenuNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Menu = () => {
  const navigation = useNavigation<MenuNavigationProp>();
  const { showError } = useAlert();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleLogout = async () => {
    setLogoutVisible(false);

    try {
      await authService.signOut();
    } catch (err) {
      console.log("Logout error", err);
    }
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

  return (
    <>
      <View style={styles.topRow}>
        <UserHeader />

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuOpen(true)}
        >
          <Ionicons name="menu-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ProfileSettingsModal
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onTransactionHistory={() => {
          setMenuOpen(false);
          navigation.navigate('TransactionHistory');
        }}
        onLeaderboard={() => {
          setMenuOpen(false);
          navigation.navigate('Leaderboard');
        }}
        onOtherApps={() => {
          setMenuOpen(false);
          navigation.navigate('OtherApps');
        }}
        onCheckUpdate={() => {
          setMenuOpen(false);
          navigation.navigate('CheckUpdate');
        }}
        onFAQ={() => {
          setMenuOpen(false);
          navigation.navigate('FAQ');
        }}
        onTermsAndConditions={() => {
          setMenuOpen(false);
          navigation.navigate('TermsAndConditions');
        }}
        onConnectUs={() => {
          setMenuOpen(false);
          navigation.navigate('ConnectUs');
        }}
        onDeleteAccount={() => {
          setMenuOpen(false);
          setDeleteAccountVisible(true);
        }}
        onLogout={() => {
          setMenuOpen(false);
          setLogoutVisible(true);
        }}
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
    </>
  );
};

export default Menu;
