import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {getUserDisplayName, useUser} from '../../context/UserContext';

import styles from './UserHeader.styles';

const UserHeader = () => {
  const {user} = useUser();

  if (!user) {
    return <Text style={localStyles.loadingText}>Loading...</Text>;
  }

  return (
    <View >
      
      {/* LEFT */}
      <View style={styles.left}>
        <Image
          source={
            user.photoURL
              ? {uri: user.photoURL}
              : require('../../assets/images/auth_bg.png')
          }
          style={styles.avatar}
        />

        <View>
          <View style={styles.row}>
            <Text style={styles.name}>{getUserDisplayName(user)}</Text>
            <View style={styles.plan}>
              <Text style={styles.planText}>{user.plan || 'Free'} Plan</Text>
            </View>
          </View>

          <Text style={styles.email}>{user.email || 'No email available'}</Text>
        </View>

      </View>


      {/* Right */}

    </View>
  );
};

const localStyles = StyleSheet.create({
  loadingText: {
    color: '#FFFFFF',
  },
});

export default UserHeader;
