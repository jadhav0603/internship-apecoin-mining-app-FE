import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/COLORS';
import { useMining } from '../../context/MiningContext';
import { useRewardsData } from '../../hooks/useRewardsData';
import { useReferralData } from '../../hooks/useReferralData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

interface ProgressCardProps {
  title: string;
  value: string;
  progress: number; // 0 to 1
  icon: string;
  color: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ title, value, progress, icon, color }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthPercent = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      
      <Text style={styles.cardValue}>{value}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: widthPercent, backgroundColor: color }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
};

const MyProgressScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { miningData } = useMining();
  const { totalCollected } = useRewardsData();
  const { referralCount } = useReferralData();

  // Mock goals for progress calculation
  const miningGoal = 1000;
  const rewardGoal = 500;
  const referralGoal = 50;

  const miningProgress = Math.min((miningData?.totalEarned ?? 0) / miningGoal, 1);
  const rewardProgress = Math.min(totalCollected / rewardGoal, 1);
  const referralProgress = Math.min(referralCount / referralGoal, 1);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientMid, COLORS.backgroundGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Progress</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 20}
        decelerationRate="fast"
      >
        <ProgressCard 
          title="Mining Progress"
          value={`${(miningData?.totalEarned ?? 0).toFixed(2)} APC`}
          progress={miningProgress}
          icon="hammer-outline"
          color="#39FF14"
        />
        <ProgressCard 
          title="Reward Progress"
          value={`${totalCollected.toFixed(2)} APC`}
          progress={rewardProgress}
          icon="gift-outline"
          color="#FF1493"
        />
        <ProgressCard 
          title="Referral Progress"
          value={`${referralCount} Users`}
          progress={referralProgress}
          icon="people-outline"
          color="#14ffe4"
        />
      </ScrollView>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Keep Mining!</Text>
        <Text style={styles.infoSubtitle}>Complete your goals to unlock exclusive rewards and higher mining tiers.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 30,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(18, 26, 18, 0.8)',
    borderRadius: 24,
    padding: 24,
    marginRight: 20,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 20, 0.1)',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  cardValue: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 25,
  },
  progressContainer: {
    width: '100%',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  infoContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
    alignItems: 'center',
  },
  infoTitle: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MyProgressScreen;
