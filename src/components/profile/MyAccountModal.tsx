import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import { PROFILE_THEME, getInitial } from './profileTheme';

type MyAccountModalProps = {
  visible: boolean;
  username: string;
  email: string;
  avatarSource?: ImageSourcePropType;
  isLoggingOut?: boolean;
  onClose: () => void;
  onLogout: () => void;
  onEditUsername?: () => void;
  onSaveUsername?: (newUsername: string) => Promise<void>;
  isUpdatingUsername?: boolean;
  onChangePhoto?: () => void;
};

const MyAccountModal = ({
  visible,
  username,
  email,
  avatarSource,
  isLoggingOut = false,
  onClose,
  onLogout,
  onEditUsername,
  onSaveUsername,
  isUpdatingUsername = false,
  onChangePhoto,
}: MyAccountModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(22)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      setTempUsername(username);
      setIsEditing(false);
    }
  }, [visible, username]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    opacityAnim.setValue(0);
    translateYAnim.setValue(22);
    scaleAnim.setValue(0.96);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        damping: 16,
        stiffness: 180,
        mass: 0.7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 180,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityAnim, scaleAnim, translateYAnim, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView
          style={StyleSheet.absoluteFill as unknown as object}
          blurType="dark"
          blurAmount={18}
          reducedTransparencyFallbackColor="rgba(5, 8, 5, 0.92)"
        />

        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>My Account</Text>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.45)" />
            </Pressable>
          </View>

          <View style={styles.avatarWrapper}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatarInner}>
                {avatarSource ? (
                  <Image source={avatarSource} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <View style={styles.fallbackAvatar}>
                    <Text style={styles.initialText}>{getInitial(username)}</Text>
                  </View>
                )}
              </View>
            </View>

            <Pressable onPress={onChangePhoto} style={styles.cameraButton}>
              <Ionicons name="camera-outline" size={18} color="#0f160c" />
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Username</Text>

            {isEditing ? (
              <View style={[styles.fieldBox, styles.editBox]}>
                <TextInput
                  style={styles.fieldValue}
                  value={tempUsername}
                  onChangeText={setTempUsername}
                  autoFocus
                  placeholder="New username"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  selectionColor={PROFILE_THEME.neonGreen}
                />
                <View style={styles.editActions}>
                  {isUpdatingUsername ? (
                    <ActivityIndicator color={PROFILE_THEME.neonGreen} size="small" />
                  ) : (
                    <>
                      <Pressable
                        onPress={() => {
                          if (onSaveUsername) {
                            onSaveUsername(tempUsername).then(() => setIsEditing(false));
                          }
                        }}
                        style={styles.actionIcon}
                      >
                        <Ionicons name="checkmark-circle-outline" size={28} color={PROFILE_THEME.neonGreen} />
                      </Pressable>
                      <Pressable onPress={() => setIsEditing(false)} style={styles.actionIcon}>
                        <Ionicons name="close-circle-outline" size={28} color="#ff5c5c" />
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setIsEditing(true)}
                style={({ pressed }) => [
                  styles.fieldBox,
                  pressed ? styles.fieldBoxPressed : null,
                ]}
              >
                <Text style={styles.fieldValue}>{username}</Text>
                <Ionicons name="create-outline" size={22} color={PROFILE_THEME.neonGreen} />
              </Pressable>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email ID</Text>

            <View style={[styles.fieldBox, styles.emailBox]}>
              <Text style={[styles.fieldValue, styles.emailValue]}>
                {email || 'Not available'}
              </Text>
              <Ionicons name="lock-closed-outline" size={21} color="rgba(255,255,255,0.55)" />
            </View>
          </View>

          <Pressable
            onPress={onLogout}
            disabled={isLoggingOut}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && !isLoggingOut ? styles.logoutButtonPressed : null,
              isLoggingOut ? styles.logoutButtonDisabled : null,
            ]}
          >
            {isLoggingOut ? (
              <ActivityIndicator color={PROFILE_THEME.danger} size="small" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={24} color={PROFILE_THEME.danger} />
                <Text style={styles.logoutText}>Log Out</Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 4, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(170,255,0,0.42)',
    backgroundColor: 'rgba(16, 22, 14, 0.96)',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 26,
    shadowColor: PROFILE_THEME.neonGreen,
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: PROFILE_THEME.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginTop: 28,
    marginBottom: 30,
  },
  avatarOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: PROFILE_THEME.neonGreen,
    backgroundColor: '#1b2419',
    padding: 3,
    shadowColor: PROFILE_THEME.neonGreen,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  avatarInner: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 49,
    backgroundColor: PROFILE_THEME.avatarFallbackBg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  fallbackAvatar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c7f76',
  },
  initialText: {
    color: PROFILE_THEME.white,
    fontSize: 34,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  cameraButton: {
    position: 'absolute',
    right: -2,
    bottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PROFILE_THEME.neonGreen,
    borderWidth: 2,
    borderColor: '#182014',
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    marginBottom: 10,
    paddingLeft: 4,
  },
  fieldBox: {
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#1a2318',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  fieldBoxPressed: {
    opacity: 0.9,
  },
  emailBox: {
    backgroundColor: '#171e15',
  },
  fieldValue: {
    color: PROFILE_THEME.white,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  emailValue: {
    color: 'rgba(255,255,255,0.62)',
  },
  logoutButton: {
    height: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,92,92,0.35)',
    backgroundColor: 'rgba(48, 30, 23, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  logoutButtonPressed: {
    opacity: 0.92,
  },
  logoutButtonDisabled: {
    opacity: 0.78,
  },
  logoutText: {
    color: PROFILE_THEME.danger,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginLeft: 10,
  },
  editBox: {
    borderColor: 'rgba(170,255,0,0.4)',
    backgroundColor: '#1c281a',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 12,
  },
});

export default MyAccountModal;
