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
import styles from './LeaderboardScreen.style';

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
            style={styles.avatarImageFill}
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
        style={styles.absoluteFill}
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

export default LeaderboardScreen;
