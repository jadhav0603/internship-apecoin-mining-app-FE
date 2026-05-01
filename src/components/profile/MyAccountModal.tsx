import React, { useEffect, useRef, useState } from 'react';
import {
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
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import Loading from '../constant/Loading';
import { PROFILE_THEME, getInitial } from './profileTheme';
import SafeBlurView from '../constant/SafeBlurView';
import styles from './MyAccountModal.style';


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
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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
        <SafeBlurView
          style={StyleSheet.absoluteFill as unknown as object}
          blurType="dark"
          blurAmount={18}
          reducedTransparencyFallbackColor="rgba(5, 8, 5, 0.92)"
        />

        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          style={[
            styles.shadowContainer,
            {
              opacity: opacityAnim,
              transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.cardWrapper}>
            <Animated.View style={[styles.rotatingGradient, { transform: [{ rotate: spin }] }]}>
              <LinearGradient
                colors={['#39FF14', '#10160e', '#53ff14ff', '#10160e']}
                locations={[0, 0.25, 0.5, 0.75]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <View style={styles.cardInner}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>My Profile</Text>

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
                    <Loading size="small" text={null} />
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

            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default MyAccountModal;
