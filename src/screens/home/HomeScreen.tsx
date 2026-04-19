import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {
  BottomTabNavigationProp,
  useBottomTabBarHeight,
} from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/COLORS';
import MiningButton from '../../components/mining/MiningButton';
import Menu from '../../components/home/Menu';
import { BottomTabParamList, RootStackParamList } from '../../navigation/types';
import styles from './home.styles';
import BalanceCard from '../../components/home/BalanceCard';
import MiningTimeSelectionPopup from '../../components/mining/MiningTimeSelectionPopup';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const tabBarHeight = useBottomTabBarHeight();

  const handleOpenMining = () => {
    navigation.navigate('Mining', { time: 1 });
  };

  return (
    <LinearGradient
      colors={[
        COLORS.backgroundGradientStart,
        COLORS.backgroundGradientMid,
        COLORS.backgroundGradientEnd,
      ]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.primaryGlow} />
        <View style={styles.secondaryGlow} />

        <Menu />

        <BalanceCard />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarHeight + 36 },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.primaryGlow} />
            <View style={styles.secondaryGlow} />

            <View>
              {/* <Text style={styles.badge}>APECOIN ACCESS</Text> */}
              <Text style={styles.title}>Launch the mining Dashboard</Text>
              <Text style={styles.subtitle}>
                The main CTA stays centered in the content area, with breathing
                room above and below.
              </Text>

              <View style={styles.buttonContainer}>
                <MiningButton onPress={handleOpenMining} />
              </View>

              <MiningTimeSelectionPopup />

              {/* <Text style={styles.footerText}>TAP TO CONTINUE</Text> */}
            </View>
          </SafeAreaView>

          <View style={styles.analyticsGrid}>
            <LinearGradient
              colors={['rgba(22, 33, 11, 0.94)', 'rgba(11, 16, 9, 0.98)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.analyticsCard}
            >
              <Text style={styles.analyticsLabel}>Portfolio Health</Text>
              <Text style={styles.analyticsValue}>Stable</Text>
              <Text style={styles.analyticsBody}>
                Allocation is balanced across mining, staking, and rewards.
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(44, 60, 16, 0.9)', 'rgba(13, 19, 9, 0.96)']}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.analyticsCard}
            >
              <Text style={styles.analyticsLabel}>Liquidity Window</Text>
              <Text style={styles.analyticsValue}>08:45 UTC</Text>
              <Text style={styles.analyticsBody}>
                Best projected swap depth for the next reward unlock cycle.
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;
