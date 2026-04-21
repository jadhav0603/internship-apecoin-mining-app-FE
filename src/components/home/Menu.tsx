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

import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

import styles from './Menu.styles';
import { COLORS } from '../../constants/COLORS';
import { authService } from '../../services/authService';
import UserHeader from './UserHeader';

const SCREEN_WIDTH = Dimensions.get('window').width;

const Menu = () => {
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
      await authService.signOut();
    } catch (err) {
      console.log("Logout error", err);
    }
  };

  return (
    <>
      {/* HEADER */}
      <View style={styles.topRow}>
        <UserHeader />

        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleMenu}
        >
          <Ionicons name="menu" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* OVERLAY */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleMenu}
        />
      )}

      {/* FULL SCREEN MENU */}
      <Animated.View
        pointerEvents={menuOpen ? "auto" : "none"}
        style={[
          styles.menuContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={styles.drawer}>
          <ImageBackground
            source={require('../../assets/images/drawer-bg2.webp')}
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
                  <Text style={[styles.menuItem, localStyles.logoutText]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </ScrollView>

            </View>
          </ImageBackground>
        </View>
      </Animated.View>
    </>
  );
};

const localStyles = {
  logoutText: {
    color: 'red',
  },
} as const;

export default Menu;
