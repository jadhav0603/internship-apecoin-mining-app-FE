import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../constants/COLORS';
import AppBackButton from '../../components/navigation/AppBackButton';
import Loading from '../../components/constant/Loading';
import { useUser, getUserDisplayName } from '../../context/UserContext';
import { useAlert } from '../../context/AlertContext';
import { userService } from '../../services/userService';
import styles from './ProfileDetailsScreen.style';

const ProfileDetailsScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUser();
  const { showError, showSuccess } = useAlert();
  const [username, setUsername] = useState(getUserDisplayName(user));
  const [avatarUri, setAvatarUri] = useState(user?.photoURL ?? '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      showError('Username cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      await userService.updateProfile(username.trim());
      showSuccess('Profile updated successfully!');
      navigation.goBack();
    } catch (err: any) {
      showError(err?.response?.data?.message ?? 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePhoto = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.didCancel || result.errorCode || !result.assets?.[0]?.uri)
        return;

      const asset = result.assets[0];
      setIsUploading(true);

      const response = await userService.uploadProfileImage(
        asset.uri!,
        asset.type ?? 'image/jpeg',
        asset.fileName ?? 'avatar.jpg',
      );

      setAvatarUri(response.imageUrl);
      setUser(prev => (prev ? { ...prev, photoURL: response.imageUrl } : prev));
      showSuccess('Profile photo updated!');
    } catch {
      showError('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  }, [setUser, showError, showSuccess]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[
          COLORS.backgroundGradientStart,
          COLORS.backgroundGradientMid,
          COLORS.backgroundGradientEnd,
        ]}
        style={styles.absoluteFill}
      />

      <View style={styles.header}>
        <AppBackButton onPress={() => navigation.goBack()} iconSize={24} />
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <Loading size="small" text={null} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image
              source={
                avatarUri
                  ? { uri: avatarUri }
                  : require('../../assets/images/splashScreen-1.webp')
              }
              style={styles.avatar}
            />
            {isUploading && (
              <View style={styles.uploadOverlay}>
                <Loading size="small" text={null} />
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleChangePhoto}
            >
              <Ionicons name="camera" size={20} color={COLORS.black} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.placeholder}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={[styles.inputWrapper, styles.disabledInput]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: COLORS.textMuted }]}
                value={user?.email}
                editable={false}
              />
              <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileDetailsScreen;
