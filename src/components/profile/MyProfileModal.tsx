import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { useUser, getUserDisplayName } from '../../context/UserContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';

interface MyProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const MyProfileModal: React.FC<MyProfileModalProps> = ({ visible, onClose }) => {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<{ uri: string; type: string; name: string } | null>(null);

  useEffect(() => {
    if (visible) {
      setDisplayName(getUserDisplayName(user));
      setIsEditing(false);
      setNewAvatar(null);
      setImageFile(null);
    }
  }, [visible, user]);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0].uri) {
      setNewAvatar(result.assets[0].uri);
      setImageFile({
        uri: result.assets[0].uri,
        type: result.assets[0].type || 'image/jpeg',
        name: result.assets[0].fileName || 'avatar.jpg',
      });
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      let finalPhotoURL = user?.photoURL || '';

      // 1. If there's a new image, upload it first
      if (imageFile) {
        const uploadRes = await userService.uploadProfileImage(
          imageFile.uri,
          imageFile.type,
          imageFile.name
        );
        finalPhotoURL = uploadRes.imageUrl;
      }

      // 2. Update backend profile name
      await userService.updateProfile(displayName.trim());

      // 3. Update Firebase Profile (so token/auth is sync)
      await authService.updateProfile({
        displayName: displayName.trim(),
        photoURL: finalPhotoURL,
      });
      
      // 4. Update local context
      setUser(prev => prev ? {
        ...prev,
        displayName: displayName.trim(),
        photoURL: finalPhotoURL,
      } : null);

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const avatarSource = newAvatar 
    ? { uri: newAvatar } 
    : (user?.photoURL ? { uri: user.photoURL } : require('../../assets/images/splashScreen-1.webp'));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Profile' : 'My Profile'}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <View style={styles.avatarSection}>
                  <View style={styles.avatarWrapper}>
                    <Image source={avatarSource} style={styles.avatar} />
                    {isEditing && (
                      <TouchableOpacity style={styles.cameraIcon} onPress={handlePickImage}>
                        <Ionicons name="camera" size={20} color="#000" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {isEditing ? (
                  <View style={styles.editSection}>
                    <Text style={styles.inputLabel}>Display Name</Text>
                    <TextInput
                      style={styles.input}
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="Enter your name"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      autoFocus
                    />
                    
                    <TouchableOpacity 
                      style={styles.saveButton} 
                      onPress={handleSave}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.cancelButton} 
                      onPress={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.infoSection}>
                    <Text style={styles.userName}>{getUserDisplayName(user)}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>

                    <TouchableOpacity 
                      style={styles.editProfileButton} 
                      onPress={() => setIsEditing(true)}
                    >
                      <Ionicons name="create-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                      <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#121A12',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.15)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 10,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.bold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  avatarSection: {
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 4,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#121A12',
  },
  infoSection: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.black,
    textAlign: 'center',
  },
  userEmail: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
    fontFamily: FONTS.medium,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(166, 255, 0, 0.08)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(166, 255, 0, 0.2)',
  },
  editProfileButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontFamily: FONTS.bold,
  },
  editSection: {
    width: '100%',
  },
  inputLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.bold,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.medium,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  cancelButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
});

export default MyProfileModal;
