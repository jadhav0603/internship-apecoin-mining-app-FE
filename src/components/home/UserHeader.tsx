import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity,Animated,
  Dimensions} from 'react-native';
import {useUser} from '../../context/UserContext';

import styles from './UserHeader.styles';

const UserHeader = () => {
  const {user} = useUser();

  console.log(user);


  // if (!user) return null;

  if (!user) {
  return <Text style={{ color: "white" }}>Loading...</Text>;
}

  return (
    <View >
      
      {/* LEFT */}
      <View style={styles.left}>
        <Image source={{uri: user.photoURL}} style={styles.avatar} />

        <View>
          <View style={styles.row}>
            <Text style={styles.name}>{user.displayName}</Text>
            <View style={styles.plan}>
              <Text style={styles.planText}>{user.plan} Plan</Text>
            </View>
          </View>

          <Text style={styles.email}>{user.email}</Text>
        </View>

      </View>


      {/* Right */}

    </View>
  );
};

export default UserHeader;