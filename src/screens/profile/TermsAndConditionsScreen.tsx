import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TermsModal from '../../components/terms/TermsModal';
import { userService } from '../../services/userService';
import { useUser } from '../../context/UserContext';
import { COLORS } from '../../constants/COLORS';
import styles from './TermsAndConditionsScreen.style';

const TermsAndConditionsScreen = () => {
  const navigation = useNavigation();
  const { setUser } = useUser();
  const [accepting, setAccepting] = useState(false);

  const close = () => {
    navigation.goBack();
  };

  const handleAccept = async () => {
    if (accepting) {
      return;
    }

    try {
      setAccepting(true);
      const updatedUser = await userService.acceptTerms();
      setUser(prev =>
        prev ? { ...prev, ...updatedUser, acceptedTerms: true } : prev,
      );
      close();
    } catch (error) {
      if (__DEV__) {
        console.log('[terms] failed to accept terms from profile:', error);
      }
    } finally {
      setAccepting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TermsModal
        visible
        accepting={accepting}
        onAccept={handleAccept}
        onClose={close}
      />
    </View>
  );
};

export default TermsAndConditionsScreen;
