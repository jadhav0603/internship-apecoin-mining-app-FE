import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TabScene from '../../components/layout/TabScene';
import { authService } from '../../services/authService';
import { RootStackParamList } from '../../navigation/types';

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigation.replace('SignIn');
    } catch (error) {
      console.error('Profile logout error:', error);
    }
  };

  return (
    <TabScene
      eyebrow="PROFILE SETTINGS"
      title="Keep account controls in the same visual system."
      description="Profile is now rendered inside the tab navigator instead of a raw placeholder view, which keeps spacing, safe areas, and bottom navigation behavior consistent."
      metrics={[
        { label: 'Security Score', value: '92 / 100' },
        { label: 'Devices Online', value: '03' },
        { label: 'Backup Status', value: 'Synced' },
      ]}
      cardTitle="Account Readiness"
      cardBody="KYC status, security actions, and preference modules can now slot into a structured profile layout without fighting the header or tab bar placement."
    >
      <View style={styles.actionRow}>
        <Text style={styles.actionLabel}>Demo logout</Text>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </TabScene>
  );
};

const styles = StyleSheet.create({
  actionRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  actionLabel: {
    color: '#B0C987',
    marginBottom: 10,
    fontSize: 14,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 36,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProfileScreen;
