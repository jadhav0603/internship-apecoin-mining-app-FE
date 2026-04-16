import React, { useRef, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

import styles from './header.styles';
import { COLORS } from '../../constants/COLORS';
import { getAuth, signOut } from '@react-native-firebase/auth';
import UserHeader from './UserHeader';

const SCREEN_WIDTH = Dimensions.get('window').width;

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLogout = async () => {
    try {
      const authInstance = getAuth();

      if (!authInstance.currentUser) return;

      await signOut(authInstance);
    } catch (err) {
      console.log("Logout error", err);
    }
  };

  return (
    <View style={styles.main}>
      <View>
        <View style={styles.topRow}>
          <UserHeader />

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.menuButton}
            onPress={toggleMenu}
          >
            <Ionicons name="menu" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Overlay */}
        {menuOpen && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={toggleMenu}
          />
        )}

        {/* 🔥 Sliding Menu */}
        <Animated.View
          style={[
            styles.menuContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <ImageBackground
            source={require('../../assets/images/menu-bg.jpeg')}
            style={styles.menuBg}
            imageStyle={styles.menuBgImage}
          >
            <View style={styles.menuOverlay}>

              {/* Header */}
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>

                <TouchableOpacity onPress={toggleMenu}>
                  <AntDesign name="close" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Menu */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {[
                  "Leader Dashboard",
                  "Other App",
                  "Report",
                  "FAQ",
                  "Terms & Conditions",
                  "Connect Us",
                  "Delete Account",
                ].map((item, index) => (
                  <TouchableOpacity key={index} style={styles.menuItemBox}>
                    <Text style={styles.menuItem}>{item}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.menuItemBox} onPress={handleLogout}>
                  <Text style={[styles.menuItem, { color: 'red' }]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </ScrollView>

            </View>
          </ImageBackground>
        </Animated.View>

        {/* Bottom Cards */}
        <View style={styles.container}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <MaterialCommunityIcons
                  name="flash-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Mining Power</Text>
                <Text style={styles.metricValue}>0.471609 APC</Text>
              </View>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricIconWrap}>
                <Ionicons
                  name="wallet-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Liquid Balance</Text>
                <Text style={styles.metricValue}>0.00000000</Text>
              </View>
            </View>
          </View>
        </View>

      </View>
    </View>
  );
};

export default Header;