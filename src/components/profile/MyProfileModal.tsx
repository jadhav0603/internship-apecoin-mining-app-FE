import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { useUser, getUserDisplayName } from '../../context/UserContext';
import { useAlert } from '../../context/AlertContext';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import styles from './MyProfileModal.style';


interface MyProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const MyProfileModal: React.FC<MyProfileModalProps> = ({ visible, onClose }) => {
  const { user, setUser } = useUser();
  const { showError, showSuccess } = useAlert();
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
      showError('Name cannot be empty');
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
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      showError('Failed to update profile');
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
                      <Ionicons name="create-outline" size={20} color={COLORS.primary} style={styles.editProfileIcon} />
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

export default MyProfileModal;
