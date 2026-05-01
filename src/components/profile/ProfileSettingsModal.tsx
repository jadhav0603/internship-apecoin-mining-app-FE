import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/COLORS';
import styles from './ProfileSettingsModal.style';


interface ProfileSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onTransactionHistory: () => void;
  onLeaderboard: () => void;
  onOtherApps: () => void;
  onCheckUpdate: () => void;
  onFAQ: () => void;
  onTermsAndConditions: () => void;
  onConnectUs: () => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  visible,
  onClose,
  onTransactionHistory,
  onLeaderboard,
  onOtherApps,
  onCheckUpdate,
  onFAQ,
  onTermsAndConditions,
  onConnectUs,
  onDeleteAccount,
  onLogout,
}) => {
  const menuItems = [
    {
      label: 'Transaction History',
      icon: 'list-outline',
      onPress: onTransactionHistory,
    },
    { label: 'Leaderboard', icon: 'trophy-outline', onPress: onLeaderboard },
    { label: 'Other Apps', icon: 'apps-outline', onPress: onOtherApps },
    { label: 'Check Update', icon: 'sync-outline', onPress: onCheckUpdate },
    { label: 'FAQ', icon: 'help-circle-outline', onPress: onFAQ },
    {
      label: 'Terms & Conditions',
      icon: 'document-text-outline',
      onPress: onTermsAndConditions,
    },
    { label: 'Connect Us', icon: 'share-social-outline', onPress: onConnectUs },
    {
      label: 'Delete Account',
      icon: 'trash-outline',
      onPress: onDeleteAccount,
      color: '#FF4B4B',
    },
    {
      label: 'Logout',
      icon: 'log-out-outline',
      onPress: onLogout,
      color: '#FF4B4B',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.content}>
              {menuItems.map((item, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={item.color || COLORS.textPrimary}
                    />
                    <Text
                      style={[
                        styles.menuText,
                        item.color ? { color: item.color } : null,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                  {index < menuItems.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ProfileSettingsModal;
