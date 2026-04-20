import React, { useEffect, useMemo } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  FadeInUp,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList } from '../../navigation/types';
import { getUserDisplayName, useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');

type LeaderboardRouteProp = RouteProp<RootStackParamList, 'Leaderboard'>;
type LeaderboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Leaderboard'>;

// Mock Data
const PODIUM_DATA = [
  { rank: 2, initials: 'AS', name: 'Silver', value: '42,860 APC', type: 'silver' },
  { rank: 1, initials: 'NB', name: 'Gold', value: '50,240 APC', type: 'gold' },
  { rank: 3, initials: 'LH', name: 'Bronze', value: '39,410 APC', type: 'bronze' },
];

const LIST_DATA = [
  { rank: 4, initials: 'MC', name: 'Mia Chen', referrals: 34, apc: '37,880 APC' },
  { rank: 5, initials: 'EN', name: 'Ethan Noor', referrals: 29, apc: '36,420 APC' },
  { rank: 6, initials: 'SV', name: 'Sofia Vega', referrals: 27, apc: '35,075 APC' },
  { rank: 7, initials: 'KB', name: 'Kai Brooks', referrals: 25, apc: '33,910 APC' },
  { rank: 8, initials: 'PD', name: 'Priya Das', referrals: 23, apc: '31,640 APC' },
];

const AnimatedRing = ({ type }: { type: string }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (type === 'gold') {
      pulse.value = withRepeat(withTiming(1.2, { duration: 1500 }), -1, true);
    }
  }, [type, pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: interpolate(pulse.value, [1, 1.2], [0.8, 0.4]),
    };
  });

  if (type !== 'gold') return null;

  return (
    <Animated.View
      style={[
        styles.ringPulse,
        { borderColor: '#FFD700' },
        animatedStyle,
      ]}
    />
  );
};

const PodiumItem = ({ data }: { data: typeof PODIUM_DATA[0] }) => {
  const isGold = data.type === 'gold';
  const scale = isGold ? 1.2 : 1;
  const colorMap: Record<string, string[]> = {
    gold: ['#FFD700', '#B8860B'],
    silver: ['#C0C0C0', '#808080'],
    bronze: ['#CD7F32', '#8B4513'],
  };
  const colors = colorMap[data.type] || ['#FFF', '#FFF'];

  return (
    <View style={[styles.podiumItem, { transform: [{ scale }] }]}>
      <View style={styles.avatarContainer}>
        <AnimatedRing type={data.type} />
        <LinearGradient
          colors={colors}
          style={styles.ring}
        >
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>{data.initials}</Text>
          </View>
        </LinearGradient>
        <View style={[styles.rankBadge, { backgroundColor: colors[0] }]}>
          <Text style={styles.rankBadgeText}>{data.rank}</Text>
        </View>
      </View>
      
      <View style={styles.podiumCard}>
        <Text style={styles.podiumTitle}>{data.name}</Text>
        <Text style={styles.podiumValue}>{data.value}</Text>
      </View>
    </View>
  );
};

const LeaderboardScreen = () => {
  const navigation = useNavigation<LeaderboardNavigationProp>();
  const route = useRoute<LeaderboardRouteProp>();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const currentMinerName = route.params?.username || getUserDisplayName(user) || 'Suraj';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0A1208', '#000000']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative Glows */}
      <View style={[styles.glow, { top: '10%', left: '-10%', backgroundColor: 'rgba(182, 255, 59, 0.1)' }]} />
      <View style={[styles.glow, { bottom: '20%', right: '-10%', backgroundColor: 'rgba(182, 255, 59, 0.05)' }]} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Top Miners</Text>
          <Pressable style={styles.filterButton}>
            <Text style={styles.filterText}>This Week</Text>
            <Ionicons name="chevron-down" size={16} color="#FFF" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Podium */}
          <View style={styles.podiumSection}>
            <PodiumItem data={PODIUM_DATA[0]} />
            <PodiumItem data={PODIUM_DATA[1]} />
            <PodiumItem data={PODIUM_DATA[2]} />
          </View>

          {/* Highlighted User Card */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.highlightCard}>
            <LinearGradient
              colors={['rgba(182, 255, 59, 0.15)', 'rgba(182, 255, 59, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.highlightGradient}
            >
              <View style={styles.highlightRankBadge}>
                <Text style={styles.highlightRankText}>12</Text>
              </View>
              <View style={styles.highlightAvatar}>
                <Text style={styles.highlightAvatarText}>{currentMinerName[0]}</Text>
              </View>
              <View style={styles.highlightInfo}>
                <Text style={styles.highlightName}>{currentMinerName}</Text>
                <Text style={styles.highlightSubtitle}>Your current weekly standing</Text>
              </View>
              <Text style={styles.highlightValue}>12,760 APC</Text>
            </LinearGradient>
          </Animated.View>

          {/* Leaderboard List */}
          <View style={styles.listContainer}>
            {LIST_DATA.map((item, index) => (
              <Animated.View 
                key={item.rank} 
                entering={FadeInUp.delay(400 + index * 100)}
                style={styles.listItem}
              >
                <Text style={styles.listRank}>{item.rank}</Text>
                <View style={styles.listAvatar}>
                  <Text style={styles.listAvatarText}>{item.initials}</Text>
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listName}>{item.name}</Text>
                  <Text style={styles.listMeta}>{item.referrals} referrals • {item.apc}</Text>
                </View>
                <Text style={styles.listValue}>{item.apc.split(' ')[0]}</Text>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFF',
    fontFamily: FONTS.bold,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterText: {
    color: '#FFF',
    fontSize: 14,
    marginRight: 4,
    fontFamily: FONTS.medium,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  podiumSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 280,
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 40,
  },
  podiumItem: {
    alignItems: 'center',
    width: width * 0.28,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  ring: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  avatarInner: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  rankBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  podiumCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  podiumTitle: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  podiumValue: {
    color: COLORS.primary || '#B6FF3B',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  highlightCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(182, 255, 59, 0.2)',
  },
  highlightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  highlightRankBadge: {
    width: 30,
    alignItems: 'center',
  },
  highlightRankText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
    opacity: 0.8,
  },
  highlightAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(182, 255, 59, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(182, 255, 59, 0.3)',
  },
  highlightAvatarText: {
    color: '#B6FF3B',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  highlightInfo: {
    flex: 1,
  },
  highlightName: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  highlightSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  highlightValue: {
    color: '#B6FF3B',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  listRank: {
    width: 25,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listAvatarText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  listMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  listValue: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
});

export default LeaderboardScreen;
