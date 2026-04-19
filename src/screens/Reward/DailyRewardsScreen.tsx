import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../api/apiClient';
import { authService } from '../../services/authService';
import ClaimPopupModal from '../../components/ClaimPopupModal';
import SuccessOverlay from '../../components/SuccessOverlay';
import RewardsGridSection from '../../components/RewardsGridSection';

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
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hrs}h ${mins}m ${secs}s`;
};

const DailyRewardsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [currency, setCurrency] = useState('APE');
  const [isAvailable, setIsAvailable] = useState(false);
  const [balance, setBalance] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

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
      const curr = data.currency || 'APE';

      setCurrentDay(data.currentDay);
      setIsAvailable(data.isAvailable);
      setCurrency(curr);

      setTimeLeft(data.nextAvailableIn || 0);

      const built = buildRewards(data.rewards || [], data.currentDay, data.isAvailable, curr);
      setRewards(built);

      // Auto-open modal if reward is claimable today
      if (data.isAvailable) {
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
      // Fallback dummy data if backend is unreachable so cards show on screen
      const dummyCurr = 'APE';
      const dummyCurrentDay = 1;
      const dummyIsAvailable = true;
      const dummyRewards = [
        { day: 1, amount: '0.014', locked: false },
        { day: 2, amount: '0.017', locked: true },
        { day: 3, amount: '0.021', locked: true },
        { day: 4, amount: '0.023', locked: true },
        { day: 5, amount: '0.029', locked: true },
        { day: 6, amount: '0.035', locked: true },
        { day: 7, amount: '0.036', locked: true },
      ];

      setCurrentDay(dummyCurrentDay);
      setIsAvailable(dummyIsAvailable);
      setCurrency(dummyCurr);
      setTimeLeft(0);

      const built = buildRewards(dummyRewards, dummyCurrentDay, dummyIsAvailable, dummyCurr);
      setRewards(built);

      // Commenting out alert as per user request to just show the cards
      // Alert.alert('Rewards unavailable', message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  useEffect(() => {
    if (!isAvailable) {
      const interval = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isAvailable]);

  const handleClaim = async () => {
    // 1. Close modal immediately
    setModalVisible(false);

    // 2. Show fullscreen success animation right away (optimistic UI)
    setShowSuccess(true);

    setClaiming(true);
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.email) throw new Error('User email not found');

      const response = await apiClient.post('rewards/daily/claim', {
        email: user.email,
      });

      const newAmount = parseFloat(response.data.amount) || 0;
      setBalance((prev) => prev + newAmount);
    } catch (error: any) {
      // If claim fails, hide success and show error
      setShowSuccess(false);
      const msg = error.response?.data?.message || 'Failed to claim reward.';
      Alert.alert('Claim Failed', msg);
    } finally {
      setClaiming(false);
    }
  };

  const handleAnimationFinish = () => {
    setShowSuccess(false);
    // Mark the current day as claimed locally (instant state update)
    setRewards((prev) =>
      prev.map((r) =>
        r.day === currentDay ? { ...r, state: 'claimed' as CardState } : r
      )
    );
    setIsAvailable(false);
    setTimeLeft(0);
    // Optionally refresh from server
    fetchRewards();
  };

  const handleOpenModal = () => {
    if (isAvailable) setModalVisible(true);
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
          contentContainerStyle={styles.scrollContent}
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
          source={require('../../assets/images/daily_rewards.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />

        {!isAvailable && timeLeft > 0 && (
          <Text style={styles.timerText}>
            Next reward in: {formatTime(timeLeft)}
          </Text>
        )}

        <RewardsGridSection
          rewards={rewards}
          onCardPress={handleOpenModal}
        />

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
        onClaim={handleClaim}
        onClose={() => setModalVisible(false)}
      />

      {/* Fullscreen Success Overlay */}
      <SuccessOverlay
        visible={showSuccess}
        onFinish={handleAnimationFinish}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060f06',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#060f06',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    top: 30,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  titleLine: {
    marginTop: 30,
    fontSize: 56,
    fontWeight: '900',
    color: '#39FF14',
    textAlign: 'center',
    lineHeight: 60,
    textShadowColor: 'rgba(57, 255, 20, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
    letterSpacing: -1,
    transform: [{ scaleY: 1.1 }],
  },
  rewardsLine: {
    marginTop: -10,
  },
  lottieContainer: {
    width: width * 0.9,
    height: 200,
    backgroundColor: '#0d1f0d',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 10,
  },
  lottieFile: {
    width: '100%',
    height: '100%',
  },
  headerImage: {
    width: width * 1.2,
    height: 240,
    marginTop: 0,
    marginBottom: 0,
    alignSelf: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  backgroundImageStyle: {
    opacity: 0.2,
  },
  disabledButton: {
    backgroundColor: '#2a3e2a',
    shadowOpacity: 0,
    elevation: 0,
  },
  claimButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerText: {
    color: '#39FF14',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DailyRewardsScreen;
