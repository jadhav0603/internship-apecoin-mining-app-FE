import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {getUserDisplayName, useUser} from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';

import styles from './UserHeader.style';
import LinearGradient from 'react-native-linear-gradient';

const UserHeader = () => {
  const {user} = useUser();
  const navigation = useNavigation<any>();

  if (!user) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  return (
    <View >
      
      {/* LEFT */}
      <TouchableOpacity 
        style={styles.left}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
      >
        {/* <Image
          source={
            user.photoURL
              ? {uri: user.photoURL}
              : require('../../assets/images/auth_bg.webp')
          }
          style={styles.avatar}
        /> */}

          <View style={styles.avatarContainer}>
  {user?.photoURL ? (
    <Image
      source={{ uri: user.photoURL }}
      style={styles.avatar}
    />
  ) : (
    <LinearGradient
      colors={['#2E420F', '#131D0C']}
      style={styles.avatarFallback}
    >
      <Text style={styles.avatarText}>
        {getUserDisplayName(user).charAt(0).toUpperCase()}
      </Text>
    </LinearGradient>
  )}
</View>


        <View>
          <View style={styles.row}>
            <Text style={styles.name}>{getUserDisplayName(user)}</Text>
            <View style={styles.plan}>
              <Text style={styles.planText}>{user.plan || 'Free'} Plan</Text>
            </View>
          </View>

          <Text style={styles.email}>{user.email || 'No email available'}</Text>
        </View>

      </TouchableOpacity>


      {/* Right */}

    </View>
  );
};

export default UserHeader;
