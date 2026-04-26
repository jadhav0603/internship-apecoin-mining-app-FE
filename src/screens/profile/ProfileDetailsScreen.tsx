import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../constants/COLORS';
import AppBackButton from '../../components/navigation/AppBackButton';
import { useUser, getUserDisplayName } from '../../context/UserContext';
import { useAlert } from '../../context/AlertContext';
import { userService } from '../../services/userService';

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
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <AppBackButton onPress={() => navigation.goBack()} iconSize={24} />
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
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
                <ActivityIndicator color={COLORS.primary} />
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleChangePhoto}
            >
              <Ionicons name="camera" size={20} color="#000" />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: 'bold' },
  saveText: { color: COLORS.primary, fontSize: 16, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 30 },
  avatarContainer: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 3,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 60 },
  uploadOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  changePhotoText: {
    color: COLORS.primary,
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  form: { width: '100%' },
  inputGroup: { marginBottom: 25 },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: 16 },
  disabledInput: { backgroundColor: 'rgba(255,255,255,0.02)' },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ProfileDetailsScreen;
