import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './header.styles';
import { COLORS } from '../../constants/COLORS';

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.eyebrow}>Portfolio Balance</Text>
          <Text style={styles.title}>ApeCoin Grid</Text>
        </View>

        <TouchableOpacity activeOpacity={0.85} style={styles.menuButton}>
          <Ionicons name="menu" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

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
            <Ionicons name="wallet-outline" size={18} color={COLORS.primary} />
          </View>
          <View style={styles.metricContent}>
            <Text style={styles.metricLabel}>Liquid Balance</Text>
            <Text style={styles.metricValue}>0.00000000</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Header;
