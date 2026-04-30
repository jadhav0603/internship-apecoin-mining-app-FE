import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/apiClient';
import { authService } from '../../services/authService';
import ClaimPopupModal from '../../components/reward/ClaimPopupModal';
import SuccessOverlay from '../../components/constant/SuccessOverlay';
import RewardsGridSection from '../../components/reward/RewardsGridSection';
import { useAlert } from '../../context/AlertContext';
import { useWallet } from '../../context/WalletContext';
import useBottomOverlayPadding from '../../hooks/useBottomOverlayPadding';
import { BannerAd, BannerAdSize, useRewardedAd } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../../constants/AD_UNITS';
import { useAdLoadingGate } from '../../hooks/useAdLoadingGate';
import styles from './DailyRewardsScreen.style';

const { width } = Dimensions.get('window');

type CardState = 'claimable' | 'claimed' | 'locked';

interface RewardItem {
  day: number;
  amount: string;
  currency: string;
  state: CardState;
}

interface ApiRewardItem {
  day: number;
  amount: string;
  locked: boolean;
}

interface DailyRewardsResponse {
  currentDay: number;
  isAvailable: boolean;
  nextAvailableIn?: number;
  rewards: ApiRewardItem[];
  currency?: string;
}

const buildRewards = (
  apiItems: ApiRewardItem[],
  currDay: number,
  available: boolean,
  curr: string
): RewardItem[] =>
  apiItems.map(item => {
    let state: CardState;
    if (item.day === currDay && available) {
      state = 'claimable';
    } else if (item.day < currDay || (item.day === currDay && !available)) {
      state = 'claimed';
    } else {
      state = 'locked';
    }

    return { day: item.day, amount: item.amount, currency: curr, state };
  });

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return `${hrs}:${mins}:${secs}`;
};

const DailyRewardsScreen = () => {
  const { showError } = useAlert();
  const { refreshBalance } = useWallet();
  const insets = useSafeAreaInsets();
  const bottomContentPadding = useBottomOverlayPadding(24);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [claimComplete, setClaimComplete] = useState(false);
  const [showSuccess] = useState(false);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [currency, setCurrency] = useState('APE');
  const [isAvailable, setIsAvailable] = useState(false);
  const [balance, setBalance] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPendingReward, setIsPendingReward] = useState(false);
  const { isLoaded, isClosed, load, show, isEarnedReward } = useRewardedAd(
    AD_UNITS.REWARDED_DAILY,
    { requestNonPersonalizedAdsOnly: true }
  );
  const { startAd, adLoadingModal } = useAdLoadingGate({ isLoaded, load, show });

  const fetchRewards = useCallback(async () => {
    try {
      const user = await authService.waitForAuthRestore();
      if (!user || !user.email) {
        setLoading(false);
        return;
      }

      const response = await apiClient.get<DailyRewardsResponse>(
        `rewards/daily/${encodeURIComponent(user.email)}`
      );
      const data = response.data;
      const currencyFromBackend = data.currency || 'APE';

      setCurrentDay(data.currentDay);
      setIsAvailable(data.isAvailable);
      setCurrency(currencyFromBackend);

      setTimeLeft(data.nextAvailableIn || 0);

      const built = buildRewards(data.rewards || [], data.currentDay, data.isAvailable, currencyFromBackend);
      setRewards(built);

      // Auto-open modal if reward is claimable today
      if (data.isAvailable) {
        setClaimComplete(false);
        setModalVisible(true);
      }
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          (error.message === 'Network Error'
            ? 'Unable to reach the rewards service. Check that the backend is running and your device can reach it.'
            : 'Failed to load rewards. Please try again.')
        : 'Failed to load rewards. Please try again.';

      if (__DEV__) {
        console.warn('[DailyRewardsScreen] fetchRewards failed', {
          message: axios.isAxiosError(error) ? error.message : String(error),
          status: axios.isAxiosError(error) ? error.response?.status : undefined,
          url: axios.isAxiosError(error) ? error.config?.url : undefined,
          baseURL: axios.isAxiosError(error) ? error.config?.baseURL || apiClient.defaults.baseURL : undefined,
        });
      }
      showError(message, 'Rewards unavailable');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useFocusEffect(
    useCallback(() => {
      fetchRewards();
    }, [fetchRewards])
  );

  useEffect(() => {
    if (!isAvailable) {
      const interval = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isAvailable]);

  const handleClaim = () => {
    startAd({
      onAdShown: () => setIsPendingReward(true),
    });
  };

  const executeClaim = useCallback(async () => {
    setClaiming(true);
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.email) throw new Error('User email not found');

      const response = await apiClient.post('rewards/daily/claim', {
        email: user.email,
      });

      const newAmount = parseFloat(response.data.amount) || 0;
      setBalance((prev) => prev + newAmount);

      // Optimistically update local state to 'claimed'
      setRewards((prev) =>
        prev.map((r) =>
          r.day === currentDay ? { ...r, state: 'claimed' as CardState } : r
        )
      );
      setIsAvailable(false);
      setClaimComplete(true);
      setTimeLeft(0);
      await refreshBalance();
    } catch (error: any) {
      // If claim fails, close modal to show error
      setModalVisible(false);
      const msg = error.response?.data?.message || 'Failed to claim reward.';
      
      if (__DEV__) {
        console.warn('[DailyRewardsScreen] handleClaim failed', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }

      showError(msg, 'Claim Failed');
    } finally {
      setClaiming(false);
    }
  }, [currentDay, refreshBalance, showError]);

  // Effect to handle reward after ad completion
  useEffect(() => {
    if (isClosed && isPendingReward) {
      setIsPendingReward(false);
      if (isEarnedReward) {
        executeClaim();
      }
    }
  }, [executeClaim, isEarnedReward, isClosed, isPendingReward]);

  const handleAnimationFinish = () => {
    // This was previously used for the fullscreen success overlay
    // Now state updates are handled directly in handleClaim
    fetchRewards();
  };

  const handleOpenModal = () => {
    if (isAvailable) {
      setClaimComplete(false);
      setModalVisible(true);
    }
  };

  const currentReward = rewards.find((r) => r.day === currentDay);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#39FF14" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/daily_reward_background.webp')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top,
              paddingBottom: bottomContentPadding,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
        {/* Floating Title */}
        {/* <View style={styles.titleContainer}>
          <Text style={styles.titleLine}>DAILY</Text>
          <Text style={[styles.titleLine, styles.rewardsLine]}>REWARDS</Text>
        </View> */}

        {/* Lottie Banner */}
        {/* <View style={styles.lottieContainer}>
          <LottieView
            source={require('../../assets/animations/reward_first_page_animation.json')}
            autoPlay
            loop
            style={styles.lottieFile}
          />
        </View> */}

       

        <Image
          source={require('../../assets/images/daily_rewards.webp')}
          style={styles.headerImage}
          resizeMode="contain"
        />

         <View style={styles.adContainer}>
          <BannerAd
            unitId={AD_UNITS.BANNER_HOME}
            size={BannerAdSize.BANNER}
          />
        </View>

        {!isAvailable && timeLeft > 0 && (
          <Text style={styles.timerText}>
            Next reward in: {formatTime(timeLeft)}
          </Text>
        )}

        {rewards.length > 0 ? (
          <RewardsGridSection
            rewards={rewards}
            onCardPress={handleOpenModal}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading dynamic rewards from root backend...</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      </ImageBackground>

      {/* Claim Popup Modal */}
      <ClaimPopupModal
        visible={modalVisible}
        day={currentDay}
        amount={currentReward?.amount ?? '0'}
        currency={currency}
        balance={balance}
        claiming={claiming}
        claimComplete={claimComplete}
        onClaim={handleClaim}
        onClose={() => {
          setClaimComplete(false);
          setModalVisible(false);
        }}
      />

      {/* Fullscreen Success Overlay */}
      <SuccessOverlay
        visible={showSuccess}
        onFinish={handleAnimationFinish}
      />
      {adLoadingModal}
    </SafeAreaView>
  );
};

export default DailyRewardsScreen;
