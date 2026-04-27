// import React, { Component } from 'react'
// import { Text, View } from 'react-native'
// import styles from './BalanceCard.styles'
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { COLORS } from '../../constants/COLORS';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// export class BalanceCard extends Component {
//   render() {
//     return (
//        <View style={styles.container}>
//           <View style={styles.metricsRow}>
//             <View style={styles.metricCard}>
//               <View style={styles.metricIconWrap}>
//                 <MaterialCommunityIcons
//                   name="flash-outline"
//                   size={18}
//                   color={COLORS.primary}
//                 />
//               </View>
//               <View style={styles.metricContent}>
//                 <Text style={styles.metricLabel}>Mining Power</Text>
//                 <Text style={styles.metricValue}>0.471609 APC</Text>
//               </View>
//             </View>

//             <View style={styles.metricCard}>
//               <View style={styles.metricIconWrap}>
//                 <Ionicons
//                   name="wallet-outline"
//                   size={18}
//                   color={COLORS.primary}
//                 />
//               </View>
//               <View style={styles.metricContent}>
//                 <Text style={styles.metricLabel}>Liquid Balance</Text>
//                 <Text style={styles.metricValue}>0.00000000</Text>
//               </View>
//             </View>
//           </View>
//         </View>
//     )
//   }
// }

// export default BalanceCard

import React, { useEffect, useRef } from 'react';
import { Text, View, Pressable, Animated, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './BalanceCard.styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/COLORS';
import { useMining } from '../../context/MiningContext';
import { useNavigation } from '@react-navigation/native';
import { useLiquidBalance } from '../../hooks/useLiquidBalance';
import { formatAmount } from '../wallet/theme';

const BalanceCard = () => {
  const { earned, claimRewardAmount, hours, hasUnclaimedReward, openClaimPopup } = useMining();
  const navigation = useNavigation<any>();
  const { liquidBalance } = useLiquidBalance();
  const displayEarned = hasUnclaimedReward ? claimRewardAmount || earned : earned;

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.shadowContainer}>
      <View style={styles.cardWrapper}>
        <Animated.View
          style={[styles.rotatingGradient, { transform: [{ rotate: spin }] }]}
        >
          <LinearGradient
            colors={['#39FF14', '#090e07', '#14ff62ff', '#090e07']}
            locations={[0, 0.25, 0.5, 0.75]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <View style={styles.container}>
          <View style={styles.metricsRow}>
            {/* 🔥 Live Mining Rewards */}
            <Pressable
              style={styles.metricCard}
              onPress={() => {
                if (hasUnclaimedReward) {
                  openClaimPopup();
                  return;
                }

                navigation.navigate('Mining', { time: hours || 1 });
              }}
            >
              <View style={styles.metricIconWrap}>
                <MaterialCommunityIcons
                  name="pickaxe"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Mining Power</Text>
                <Text style={styles.metricValue}>{displayEarned.toFixed(6)} APC</Text>
              </View>
            </Pressable>

            {/* 💰 Wallet Balance */}
            <Pressable
              style={styles.metricCard}
              onPress={() =>
                navigation.navigate('MainTabs', { screen: 'Wallet' })
              }
            >
              <View style={styles.metricIconWrap}>
                <Ionicons
                  name="wallet-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>Liquid Balance</Text>
                <Text style={styles.metricValue}>
                  {Number(liquidBalance).toFixed(6)} APE
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BalanceCard;
