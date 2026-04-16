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

import React from 'react';
import { Text, View } from 'react-native';
import styles from './BalanceCard.styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/COLORS';
import { useMining } from '../../context/MiningContext';

const BalanceCard = () => {
  const { earned } = useMining();

  return (
    <View style={styles.container}>
      <View style={styles.metricsRow}>
        
        {/* 🔥 Mining Power (LIVE) */}
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
            <Text style={styles.metricValue}>
              {earned.toFixed(6)} APC
            </Text>
          </View>
        </View>

        {/* 💰 Wallet (for now static / later dynamic) */}
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
            <Text style={styles.metricValue}>
              0.00000000
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
};

export default BalanceCard;
