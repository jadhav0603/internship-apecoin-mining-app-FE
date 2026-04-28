import React, { useEffect } from 'react';
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
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { getUserDisplayName, useUser } from '../../context/UserContext';
import {
  useLeaderboard,
  type LeaderboardEntry,
} from '../../hooks/useLeaderboard';
import { RootStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type LeaderboardRouteProp = RouteProp<RootStackParamList, 'Leaderboard'>;
type LeaderboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Leaderboard'
>;

const PODIUM_THEME: Record<
  1 | 2 | 3,
  {
    border: string;
    iconBg: string;
    iconColor: string;
    cardColors: string[];
    pillarHeight: number;
    avatarBorder: string[];
  }
> = {
  1: {
    border: 'rgba(176, 255, 87, 0.62)',
    iconBg: 'rgba(176, 255, 87, 0.16)',
    iconColor: '#B0FF57',
    cardColors: ['rgba(22, 44, 26, 0.98)', 'rgba(8, 18, 11, 0.96)'],
    pillarHeight: 166,
    avatarBorder: ['#D8FF8D', '#7FD92E'],
  },
  2: {
    border: 'rgba(132, 227, 173, 0.34)',
    iconBg: 'rgba(132, 227, 173, 0.12)',
    iconColor: '#CFFFE7',
    cardColors: ['rgba(18, 28, 22, 0.95)', 'rgba(8, 14, 11, 0.94)'],
    pillarHeight: 136,
    avatarBorder: ['#D9E2E8', '#7B8C97'],
  },
  3: {
    border: 'rgba(224, 174, 109, 0.34)',
    iconBg: 'rgba(224, 174, 109, 0.12)',
    iconColor: '#F5D5AE',
    cardColors: ['rgba(22, 20, 16, 0.95)', 'rgba(12, 11, 8, 0.94)'],
    pillarHeight: 116,
    avatarBorder: ['#E8C28C', '#8F6231'],
  },
};

const formatScore = (score: number, digits = 4) =>
  `${score.toFixed(digits)} APE`;

const buildDisplayName = (entry?: LeaderboardEntry) => {
  if (!entry) {
    return 'Unknown Miner';
  }

  return entry.name?.trim() || entry.email;
};

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
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <LinearGradient
      colors={borderColors}
      style={[
        styles.avatarGradient,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View style={[styles.avatarInnerCircle, { borderRadius: size / 2 - 3 }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            borderRadius={size / 2 - 3}
          />
        ) : (
          <Text style={[styles.avatarInitials, { fontSize }]}>
            {initials || '?'}
          </Text>
        )}
      </View>
    </LinearGradient>
  );
};

const RankOneGlow = () => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.2, { duration: 1500 }), -1, true);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.2], [0.5, 0.16]),
  }));

  return <Animated.View style={[styles.rankOneGlow, animatedStyle]} />;
};

const PodiumItem = ({
  entry,
  rank,
}: {
  entry: LeaderboardEntry | undefined;
  rank: 1 | 2 | 3;
}) => {
  const theme = PODIUM_THEME[rank];
  const isFirst = rank === 1;
  const displayName = buildDisplayName(entry);
  const containerStyle = isFirst
    ? styles.podiumItemFirst
    : styles.podiumItemSide;

  return (
    <View style={[styles.podiumItem, containerStyle]}>
      <View style={styles.avatarBlock}>
        {isFirst ? <RankOneGlow /> : null}
        <View
          style={[
            styles.podiumIconBadge,
            { backgroundColor: theme.iconBg, borderColor: theme.border },
          ]}
        >
          <Ionicons
            name={isFirst ? 'trophy' : 'ribbon-outline'}
            size={isFirst ? 15 : 14}
            color={theme.iconColor}
          />
        </View>

        <EntryAvatar
          imageUrl={entry?.imageUrl ?? null}
          name={displayName}
          size={isFirst ? 74 : 62}
          fontSize={isFirst ? 22 : 18}
          borderColors={theme.avatarBorder}
        />
      </View>

      <LinearGradient
        colors={theme.cardColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.podiumCard,
          { minHeight: theme.pillarHeight, borderColor: theme.border },
          isFirst && styles.podiumCardFirst,
        ]}
      >
        <View style={[styles.rankChip, { borderColor: theme.border }]}>
          <Text style={styles.rankChipText}>#{rank}</Text>
        </View>

        <Text style={styles.podiumName} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.podiumEmail} numberOfLines={1}>
          {entry?.email ?? 'No email'}
        </Text>

        <Text style={styles.podiumAmount}>
          {entry ? formatScore(entry.score) : '--'}
        </Text>

        <View style={styles.podiumMetaRow}>
          <Ionicons
            name="people-outline"
            size={13}
            color="rgba(255,255,255,0.56)"
          />
          <Text style={styles.podiumMetaText}>
            {entry?.referralCount ?? 0} referrals
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const ListRow = ({
  entry,
  index,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  index: number;
  isCurrentUser: boolean;
}) => (
  <Animated.View
    entering={FadeInUp.delay(220 + index * 50)}
    style={[styles.listItem, isCurrentUser && styles.listItemHighlight]}
  >
    <View style={styles.listRankWrap}>
      <Text
        style={[styles.listRank, isCurrentUser && styles.listRankHighlight]}
      >
        #{entry.rank}
      </Text>
    </View>

    <EntryAvatar
      imageUrl={entry.imageUrl}
      name={entry.name}
      size={44}
      fontSize={15}
      borderColors={
        isCurrentUser ? ['#B9FF66', '#6BC22A'] : ['#2C3A31', '#121A15']
      }
    />

    <View style={styles.listInfo}>
      <Text
        style={[styles.listName, isCurrentUser && styles.listNameHighlight]}
        numberOfLines={1}
      >
        {entry.name}
        {isCurrentUser ? ' (You)' : ''}
      </Text>
      <Text style={styles.listMeta} numberOfLines={1}>
        {entry.email}
      </Text>
      <View style={styles.listSubMeta}>
        <Ionicons
          name="people-outline"
          size={12}
          color="rgba(255,255,255,0.48)"
        />
        <Text style={styles.listSubMetaText}>
          {entry.referralCount} referrals
        </Text>
      </View>
    </View>

    <View style={styles.listAmountWrap}>
      <Text
        style={[styles.listAmount, isCurrentUser && styles.listAmountHighlight]}
      >
        {entry.score.toFixed(2)}
      </Text>
      <Text style={styles.listAmountUnit}>APE</Text>
    </View>
  </Animated.View>
);

const LeaderboardScreen = () => {
  const navigation = useNavigation<LeaderboardNavigationProp>();
  const route = useRoute<LeaderboardRouteProp>();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  const currentUserEmail = route.params?.email ?? user?.email ?? '';
  const { data, loading, error, currentUserRank, refresh } =
    useLeaderboard(currentUserEmail);

  const podiumFirst = data.find(entry => entry.rank === 1);
  const podiumSecond = data.find(entry => entry.rank === 2);
  const podiumThird = data.find(entry => entry.rank === 3);
  const listData = data.filter(entry => entry.rank > 3);

  const currentMinerName =
    route.params?.username || getUserDisplayName(user) || 'You';
  const currentUserEntry = data.find(entry => entry.email === currentUserEmail);

  const showInitialLoading = loading && data.length === 0;
  const showInitialError = Boolean(error) && data.length === 0;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={['#020705', '#07120D', '#030806']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.radialGlow, styles.radialGlowTop]} />
      <View style={[styles.radialGlow, styles.radialGlowBottom]} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.headerAction,
              pressed && styles.headerActionPressed,
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Top Miners</Text>
            <Text style={styles.headerSubtitle}>Live crypto leaderboard</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.headerAction,
              pressed && styles.headerActionPressed,
            ]}
            onPress={refresh}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#B9FF66" />
            ) : (
              <Ionicons name="refresh-outline" size={19} color="#FFFFFF" />
            )}
          </Pressable>
        </View>

        {showInitialLoading ? (
          <View style={styles.stateContainer}>
            <View style={styles.stateIconWrap}>
              <ActivityIndicator size="large" color="#B9FF66" />
            </View>
            <Text style={styles.stateTitle}>Loading top miners</Text>
            <Text style={styles.stateMessage}>
              Pulling the latest mining and referral rankings.
            </Text>
          </View>
        ) : null}

        {showInitialError ? (
          <View style={styles.stateContainer}>
            <View style={styles.stateIconWrap}>
              <Ionicons
                name="cloud-offline-outline"
                size={34}
                color="rgba(255,255,255,0.76)"
              />
            </View>
            <Text style={styles.stateTitle}>Unable to load leaderboard</Text>
            <Text style={styles.stateMessage}>{error}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryButtonPressed,
              ]}
              onPress={refresh}
            >
              <Ionicons name="refresh-outline" size={16} color="#08110C" />
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {!showInitialLoading && !showInitialError ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 40, 56) },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refresh}
                tintColor="#B9FF66"
              />
            }
          >
            {/* <View style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>WEEKLY MINING POWER</Text>
              <Text style={styles.heroTitle}>
                Top miners leading the ApeCoin grid
              </Text>
              <Text style={styles.heroBody}>
                Rankings combine mining output and referral performance in real
                time.
              </Text>
            </View> */}

            <View style={styles.podiumSection}>
              <PodiumItem entry={podiumSecond} rank={2} />
              <PodiumItem entry={podiumFirst} rank={1} />
              <PodiumItem entry={podiumThird} rank={3} />
            </View>

            {currentUserEntry && currentUserEntry.rank > 3 ? (
              <Animated.View
                entering={FadeInUp.delay(180)}
                style={styles.youCard}
              >
                <LinearGradient
                  colors={['rgba(185,255,102,0.14)', 'rgba(185,255,102,0.03)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.youCardGradient}
                >
                  <View style={styles.youRankPill}>
                    <Text style={styles.youRankPillText}>
                      #{currentUserRank ?? '--'}
                    </Text>
                  </View>

                  <EntryAvatar
                    imageUrl={currentUserEntry.imageUrl}
                    name={currentMinerName}
                    size={46}
                    fontSize={16}
                    borderColors={['#CBFF87', '#70C828']}
                  />

                  <View style={styles.youInfo}>
                    <Text style={styles.youName} numberOfLines={1}>
                      {currentMinerName}
                    </Text>
                    <Text style={styles.youSubtitle} numberOfLines={1}>
                      {currentUserEntry.referralCount} referrals
                    </Text>
                  </View>

                  <View style={styles.youAmountWrap}>
                    <Text style={styles.youAmount}>
                      {currentUserEntry.score.toFixed(2)}
                    </Text>
                    <Text style={styles.youAmountUnit}>APE</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            ) : null}

            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>Leaderboard Rankings</Text>
              <Text style={styles.listHeaderSubtitle}>
                {data.length} miners tracked
              </Text>
            </View>

            <View style={styles.listContainer}>
              {listData.map((item, index) => (
                <ListRow
                  key={item.email}
                  entry={item}
                  index={index}
                  isCurrentUser={item.email === currentUserEmail}
                />
              ))}

              {data.length === 0 && !loading ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconWrap}>
                    <Ionicons
                      name="trophy-outline"
                      size={34}
                      color="rgba(255,255,255,0.62)"
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No miners ranked yet</Text>
                  <Text style={styles.emptyText}>
                    Start mining and invite friends to appear on the
                    leaderboard.
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020705',
  },
  safeArea: {
    flex: 1,
  },
  radialGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.55,
  },
  radialGlowTop: {
    top: -80,
    left: -70,
    backgroundColor: 'rgba(136, 255, 84, 0.09)',
  },
  radialGlowBottom: {
    right: -90,
    bottom: 110,
    backgroundColor: 'rgba(91, 255, 168, 0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerActionPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.96 }],
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  headerSubtitle: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.54)',
    fontSize: 12,
    fontFamily: FONTS.medium,
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  heroCard: {
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(9, 17, 12, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(185,255,102,0.16)',
    marginBottom: 0,
  },
  heroEyebrow: {
    color: '#B9FF66',
    fontSize: 11,
    fontFamily: FONTS.medium,
    letterSpacing: 1.3,
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 31,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  heroBody: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.66)',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: FONTS.regular,
  },
  podiumSection: {
    minHeight: 330,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: -80,
  },
  podiumItem: {
    alignItems: 'center',
  },
  podiumItemFirst: {
    width: width * 0.33,
    marginBottom: 15,
  },
  podiumItemSide: {
    width: width * 0.275,
  },
  avatarBlock: {
    marginBottom: -18,
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumIconBadge: {
    position: 'absolute',
    top: -8,
    zIndex: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarGradient: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInnerCircle: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#111A14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  rankOneGlow: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: 'rgba(176, 255, 87, 0.95)',
    backgroundColor: 'rgba(176,255,87,0.06)',
  },
  podiumCard: {
    width: '100%',
    borderRadius: 26,
    paddingTop: 28,
    paddingHorizontal: 12,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
  },
  podiumCardFirst: {
    shadowColor: '#AEFF57',
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  rankChip: {
    minWidth: 40,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    marginBottom: 10,
  },
  rankChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  podiumName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    maxWidth: '100%',
  },
  podiumEmail: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.42)',
    fontSize: 10,
    fontFamily: FONTS.regular,
    maxWidth: '100%',
  },
  podiumAmount: {
    marginTop: 10,
    color: '#B9FF66',
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  podiumMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  podiumMetaText: {
    marginLeft: 5,
    color: 'rgba(255,255,255,0.56)',
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  youCard: {
    marginBottom: 22,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(185,255,102,0.16)',
  },
  youCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  youRankPill: {
    minWidth: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(185,255,102,0.14)',
    marginRight: 10,
  },
  youRankPillText: {
    color: '#D4FF9A',
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  youInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  youName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  youSubtitle: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.56)',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  youAmountWrap: {
    alignItems: 'flex-end',
  },
  youAmount: {
    color: '#B9FF66',
    fontSize: 17,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  youAmountUnit: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.48)',
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  listHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  listHeaderSubtitle: {
    color: 'rgba(255,255,255,0.46)',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(10, 18, 12, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  listItemHighlight: {
    borderColor: 'rgba(185,255,102,0.18)',
    backgroundColor: 'rgba(185,255,102,0.05)',
  },
  listRankWrap: {
    width: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  listRank: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  listRankHighlight: {
    color: '#B9FF66',
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  listName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  listNameHighlight: {
    color: '#D7FF9C',
  },
  listMeta: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.40)',
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  listSubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  listSubMetaText: {
    marginLeft: 5,
    color: 'rgba(255,255,255,0.56)',
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  listAmountWrap: {
    alignItems: 'flex-end',
  },
  listAmount: {
    color: '#AFFF57',
    fontSize: 17,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  listAmountHighlight: {
    color: '#D4FF96',
  },
  listAmountUnit: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.44)',
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    marginTop: 40,
  },
  stateIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stateTitle: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateMessage: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.58)',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 18,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 18,
    backgroundColor: '#B9FF66',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  retryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  retryButtonText: {
    marginLeft: 8,
    color: '#08110C',
    fontSize: 14,
    fontFamily: FONTS.bold,
    fontWeight: '800',
  },
  emptyState: {
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(9, 15, 11, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  emptyTitle: {
    marginTop: 16,
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.54)',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});

export default LeaderboardScreen;
