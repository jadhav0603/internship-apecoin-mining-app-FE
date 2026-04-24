import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS } from '../../constants/COLORS';
import MiningButton from '../../components/mining/MiningButton';
import Menu from '../../components/home/Menu';
import styles from './home.styles';
import BalanceCard from '../../components/home/BalanceCard';
import MiningTimeSelectionPopup from '../../components/mining/MiningTimeSelectionPopup';
import ClaimRewardModal from '../../components/mining/ClaimRewardModal';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';
import useBottomOverlayPadding from '../../hooks/useBottomOverlayPadding';

const HomeScreen = () => {
  const bottomContentPadding = useBottomOverlayPadding(36);

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
            { paddingBottom: bottomContentPadding },
          ]}
        >
          <View>
            <View style={styles.adContainer}>
                <BannerAd
                  unitId={AD_UNITS.BANNER_HOME}
                  size={BannerAdSize.BANNER}
                />
              </View>
              <Text style={styles.title}>Launch the mining Dashboard</Text>
              <Text style={styles.subtitle}>
                The main CTA stays centered in the content area, with breathing
                room above and below.
              </Text>

              <View style={styles.buttonContainer}>
                <MiningButton />
              </View>

              <MiningTimeSelectionPopup />
            </View>

          <ClaimRewardModal />

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
