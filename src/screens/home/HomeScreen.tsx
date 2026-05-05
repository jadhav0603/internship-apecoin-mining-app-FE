import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { COLORS } from '../../constants/COLORS';
import MiningButton from '../../components/mining/MiningButton';
import Menu from '../../components/home/Menu';
import styles from './HomeScreen.style';
import BalanceCard from '../../components/home/BalanceCard';
import InfoSlider from '../../components/home/InfoSlider';
import MiningTimeSelectionPopup from '../../components/mining/MiningTimeSelectionPopup';
import ClaimRewardModal from '../../components/mining/ClaimRewardModal';
import { useAds } from '../../context/AdContext';
import useBottomOverlayPadding from '../../hooks/useBottomOverlayPadding';
import { useMining } from '../../context/MiningContext';
import { useWallet } from '../../context/WalletContext';

const HomeScreen = () => {
  const bottomContentPadding = useBottomOverlayPadding(36);
  const { adUnits } = useAds();
  const { refreshMiningStatus } = useMining();
  const { refreshBalance } = useWallet();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await Promise.all([refreshMiningStatus(), refreshBalance()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshBalance, refreshMiningStatus, refreshing]);

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor={COLORS.primary}
            />
          }
        >
          <View>
            <View style={styles.adContainer}>
              <BannerAd
                unitId={adUnits.BANNER_HOME}
                size={BannerAdSize.BANNER}
              />
            </View>
            <Text style={styles.title}>Launch the mining Dashboard</Text>

            <View style={styles.buttonContainer}>
              <MiningButton />
            </View>

            <InfoSlider />

            <MiningTimeSelectionPopup />
          </View>

          <ClaimRewardModal />

          <View style={styles.analyticsGrid} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default HomeScreen;
