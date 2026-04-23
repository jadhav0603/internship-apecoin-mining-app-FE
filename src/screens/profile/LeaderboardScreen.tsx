import React, { useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
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
import { useLeaderboard, type LeaderboardEntry } from '../../hooks/useLeaderboard';

const { width } = Dimensions.get('window');

type LeaderboardRouteProp = RouteProp<RootStackParamList, 'Leaderboard'>;
type LeaderboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Leaderboard'>;

// ─── Avatar cell: shows real image or initials fallback ───────────────────────
const EntryAvatar = ({
  imageUrl,
  name,
  size = 64,
  fontSize = 20,
  borderColors,
}: {
  imageUrl: string | null;
  name: string;
  size?: number;
  fontSize?: number;
  borderColors: string[];
}) => {
  const initials = name
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <LinearGradient colors={borderColors} style={[styles.avatarGradient, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.avatarInnerCircle, { borderRadius: size / 2 - 3 }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" borderRadius={size / 2 - 3} />
        ) : (
          <Text style={[styles.avatarInitials, { fontSize }]}>{initials || '?'}</Text>
        )}
      </View>
    </LinearGradient>
  );
};

// ─── Animated pulse ring for #1 ───────────────────────────────────────────────
const GoldPulseRing = () => {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.25, { duration: 1400 }), -1, true);
  }, [pulse]);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.25], [0.7, 0.2]),
  }));
  return <Animated.View style={[styles.goldPulse, animStyle]} />;
};

// ─── Podium item ─────────────────────────────────────────────────────────────
const PODIUM_COLORS: Record<number, { grad: string[]; badge: string; height: number }> = {
  1: { grad: ['#FFD700', '#B8860B'], badge: '#FFD700', height: 120 },
  2: { grad: ['#C0C0C0', '#808080'], badge: '#C0C0C0', height: 90 },
  3: { grad: ['#CD7F32', '#8B4513'], badge: '#CD7F32', height: 72 },
};

const PodiumItem = ({ entry, rank }: { entry: LeaderboardEntry | undefined; rank: 1 | 2 | 3 }) => {
  const config = PODIUM_COLORS[rank];
  const isGold = rank === 1;
  const scale = isGold ? 1.15 : 1;
  const displayName = entry?.name ?? '—';
  const scoreText = entry ? `${entry.score.toFixed(4)} APE` : '—';

  return (
    <View style={[styles.podiumItem, { transform: [{ scale }] }]}>
      <View style={styles.podiumAvatarWrapper}>
        {isGold && <GoldPulseRing />}
        <EntryAvatar
          imageUrl={entry?.imageUrl ?? null}
          name={displayName}
          size={70}
          fontSize={20}
          borderColors={config.grad}
        />
        <View style={[styles.rankBadge, { backgroundColor: config.badge }]}>
          <Text style={styles.rankBadgeText}>{rank}</Text>
        </View>
      </View>
      <View style={[styles.podiumCard, { height: config.height }]}>
        <Text style={styles.podiumName} numberOfLines={1}>{displayName}</Text>
        <Text style={styles.podiumScore}>{scoreText}</Text>
        <Text style={styles.podiumReferrals}>{entry?.referralCount ?? 0} referrals</Text>
      </View>
    </View>
  );
};

// ─── List row ─────────────────────────────────────────────────────────────────
const ListRow = ({ entry, index, isCurrentUser }: { entry: LeaderboardEntry; index: number; isCurrentUser: boolean }) => (
  <Animated.View
    entering={FadeInUp.delay(300 + index * 60)}
    style={[styles.listItem, isCurrentUser && styles.listItemHighlight]}
  >
    <Text style={[styles.listRank, isCurrentUser && styles.listRankHighlight]}>
      {entry.rank}
    </Text>
    <EntryAvatar
      imageUrl={entry.imageUrl}
      name={entry.name}
      size={42}
      fontSize={14}
      borderColors={isCurrentUser ? ['#B6FF3B', '#68A820'] : ['#444', '#222']}
    />
    <View style={styles.listInfo}>
      <Text style={[styles.listName, isCurrentUser && styles.listNameHighlight]} numberOfLines={1}>
        {entry.name}{isCurrentUser ? ' (You)' : ''}
      </Text>
      <Text style={styles.listMeta}>{entry.referralCount} referrals • {entry.score.toFixed(4)} APE</Text>
    </View>
    <Text style={[styles.listScore, isCurrentUser && styles.listScoreHighlight]}>
      {entry.score.toFixed(2)}
    </Text>
  </Animated.View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const LeaderboardScreen = () => {
  const navigation = useNavigation<LeaderboardNavigationProp>();
  const route = useRoute<LeaderboardRouteProp>();
  const { user } = useUser();

  const currentUserEmail = route.params?.email ?? user?.email ?? '';
  const { data, loading, error, currentUserRank, refresh } = useLeaderboard(currentUserEmail);

  // Derive podium (positions 1, 2, 3) and list (4+)
  const podiumFirst = data.find(e => e.rank === 1);
  const podiumSecond = data.find(e => e.rank === 2);
  const podiumThird = data.find(e => e.rank === 3);
  const listData = data.filter(e => e.rank > 3);

  const currentMinerName = route.params?.username || getUserDisplayName(user) || 'You';
  const currentUserEntry = data.find(e => e.email === currentUserEmail);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.backgroundGradientStart, COLORS.backgroundGradientMid, COLORS.backgroundGradientEnd]} style={StyleSheet.absoluteFill} />

      {/* Decorative glows */}
      <View style={[styles.glow, { top: '8%', left: '-12%', backgroundColor: 'rgba(182,255,59,0.08)' }]} />
      <View style={[styles.glow, { bottom: '18%', right: '-12%', backgroundColor: 'rgba(182,255,59,0.05)' }]} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} 
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Top Miners</Text>
          <Pressable style={styles.refreshButton} onPress={refresh}>
            <Ionicons name="refresh-outline" size={20} color={loading ? 'rgba(255,255,255,0.3)' : '#FFF'} />
          </Pressable>
        </View>

        {/* Loading state */}
        {loading && data.length === 0 && (
          <View style={styles.centered}>
            <ActivityIndicator color="#B6FF3B" size="large" />
            <Text style={styles.loadingText}>Fetching leaderboard…</Text>
          </View>
        )}

        {/* Error state */}
        {error && data.length === 0 && (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={48} color="rgba(255,255,255,0.3)" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Content */}
        {(!loading || data.length > 0) && !error && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#B6FF3B" />
            }
          >
            {/* Podium */}
            <View style={styles.podiumSection}>
              <PodiumItem entry={podiumSecond} rank={2} />
              <PodiumItem entry={podiumFirst} rank={1} />
              <PodiumItem entry={podiumThird} rank={3} />
            </View>

            {/* Your rank card (if not in top 3) */}
            {currentUserEntry && currentUserEntry.rank > 3 && (
              <Animated.View entering={FadeInUp.delay(200)} style={styles.highlightCard}>
                <LinearGradient
                  colors={['rgba(182,255,59,0.15)', 'rgba(182,255,59,0.05)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.highlightGradient}
                >
                  <View style={styles.highlightRankBadge}>
                    <Text style={styles.highlightRankText}>{currentUserRank ?? '—'}</Text>
                  </View>
                  <EntryAvatar
                    imageUrl={currentUserEntry.imageUrl}
                    name={currentMinerName}
                    size={44}
                    fontSize={16}
                    borderColors={['#B6FF3B', '#68A820']}
                  />
                  <View style={styles.highlightInfo}>
                    <Text style={styles.highlightName}>{currentMinerName}</Text>
                    <Text style={styles.highlightSubtitle}>Your current weekly standing</Text>
                  </View>
                  <Text style={styles.highlightValue}>{currentUserEntry.score.toFixed(4)} APE</Text>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Leaderboard list */}
            <View style={styles.listContainer}>
              {listData.map((item, index) => (
                <ListRow
                  key={item.email}
                  entry={item}
                  index={index}
                  isCurrentUser={item.email === currentUserEmail}
                />
              ))}

              {data.length === 0 && !loading && (
                <View style={styles.emptyState}>
                  <Ionicons name="trophy-outline" size={52} color="rgba(255,255,255,0.15)" />
                  <Text style={styles.emptyText}>No data yet — start mining to appear here!</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, opacity: 0.6 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, height: 60,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  refreshButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: { fontSize: 20, color: '#FFF', fontFamily: FONTS.bold },
  scrollContent: { paddingBottom: 50 },

  // Podium
  podiumSection: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end',
    minHeight: 280, paddingHorizontal: 10, marginTop: 24, marginBottom: 30,
  },
  podiumItem: { alignItems: 'center', width: width * 0.28 },
  podiumAvatarWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarGradient: { padding: 3, alignItems: 'center', justifyContent: 'center' },
  avatarInnerCircle: {
    flex: 1, width: '100%', backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarInitials: { color: '#FFF', fontFamily: FONTS.bold },
  goldPulse: {
    position: 'absolute', width: 86, height: 86, borderRadius: 43,
    borderWidth: 2, borderColor: '#FFD700',
  },
  rankBadge: {
    position: 'absolute', bottom: -6, width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1A1A1A',
  },
  rankBadgeText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
  podiumCard: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    padding: 10, alignItems: 'center', width: '100%', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  podiumName: { color: '#FFF', fontSize: 12, fontFamily: FONTS.bold, marginBottom: 3 },
  podiumScore: { color: COLORS.primary ?? '#B6FF3B', fontSize: 11, fontFamily: FONTS.medium },
  podiumReferrals: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 },

  // User highlight
  highlightCard: {
    marginHorizontal: 20, borderRadius: 18, overflow: 'hidden',
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(182,255,59,0.25)',
  },
  highlightGradient: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  highlightRankBadge: { width: 28, alignItems: 'center' },
  highlightRankText: { color: '#FFF', fontSize: 16, fontFamily: FONTS.bold, opacity: 0.85 },
  highlightInfo: { flex: 1, marginLeft: 10 },
  highlightName: { color: '#FFF', fontSize: 15, fontFamily: FONTS.bold },
  highlightSubtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: FONTS.regular },
  highlightValue: { color: '#B6FF3B', fontSize: 14, fontFamily: FONTS.bold },

  // List
  listContainer: { paddingHorizontal: 16 },
  listItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12,
    marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 10,
  },
  listItemHighlight: {
    borderColor: 'rgba(182,255,59,0.25)',
    backgroundColor: 'rgba(182,255,59,0.05)',
  },
  listRank: { width: 24, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: FONTS.medium },
  listRankHighlight: { color: '#B6FF3B' },
  listInfo: { flex: 1 },
  listName: { color: '#FFF', fontSize: 14, fontFamily: FONTS.bold },
  listNameHighlight: { color: '#B6FF3B' },
  listMeta: { color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: FONTS.regular, marginTop: 1 },
  listScore: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: FONTS.bold },
  listScoreHighlight: { color: '#B6FF3B' },

  // States
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 80 },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: FONTS.regular, marginTop: 10 },
  errorText: { color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', paddingHorizontal: 30 },
  retryButton: {
    marginTop: 8, paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: '#B6FF3B', borderRadius: 20,
  },
  retryText: { color: '#000', fontFamily: FONTS.bold, fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },
});

export default LeaderboardScreen;
